// analyseRouter.ts
import { exec } from "child_process";
import fileStorage from "./fileStorage";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs/promises";
import path from "path";
import { queue } from "async";

// 定义分析输入类型
type AnalyseInput = {
  budget: number;
  process: number;
  sampleNum: number;
  fileId: string;
};

// 定义结果类型
type CommandResult = {
  result: string;
};

// 创建队列
const commandQueue = queue(
  async (task: AnalyseInput) => {
    return analyseFolder(task);
  },
  1
);

// 统一的分析函数
const analyseFolder = async ({
  budget,
  process:coreCount,
  sampleNum,
  fileId,
}: AnalyseInput): Promise<CommandResult> => {
  try {
    const project_root = process.cwd();
    const folderPath = path.join(project_root, 'output', fileId);

    // 检查是否为文件夹
    const stats = await fs.stat(folderPath);
    if (stats.isDirectory()) {
      // 处理文件夹
      const files = await readFolderFiles(folderPath);

      // 寻找config.txt
      let configContent = "";
      for (const file of files) {
        if (file.path.endsWith("config.txt")) {
          configContent = file.content.trim();
          break;
        }
      }

      if (!configContent) {
        throw new Error("Config file not found in the folder");
      }

      const command = `opam switch 5.1.0 && eval $(opam env) && frama-c ${configContent} -parf -parf-budget ${budget} -parf-process ${coreCount} -parf-sample-num ${sampleNum}`;
      const { stdout, stderr } = await new Promise<{
        stdout: string;
        stderr: string;
      }>((resolve, reject) => {
        exec(
          command,
          {
            maxBuffer: 1024 * 1024 * 20,
            cwd: folderPath,
          },
          (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve({ stdout, stderr });
            }
          }
        );
      });

      const combinedOutput = `${stdout}${stderr}`
        .split("\n")
        .filter((line) => !line.includes(".parf_temp_files"))
        .join("\n");

      return { result: combinedOutput };
    } else {
      // 处理单个文件
      const file = fileStorage.get(parseInt(fileId));
      if (!file) {
        throw new Error("File not found");
      }
      const fileContent = file.content;
      const tempFilePath = path.join(folderPath);

      await fs.writeFile(tempFilePath, fileContent);

      const command = `opam switch 5.1.0 && eval $(opam env) && frama-c ${tempFilePath} -parf -parf-budget ${budget} -parf-process ${coreCount} -parf-sample-num ${sampleNum}`;

      const { stdout, stderr } = await new Promise<{
        stdout: string;
        stderr: string;
      }>((resolve, reject) => {
        exec(
          command,
          {
            maxBuffer: 1024 * 1024 * 10,
            cwd: path.dirname(tempFilePath),
          },
          (error, stdout, stderr) => {
            if (error) {
              reject(error);
            } else {
              resolve({ stdout, stderr });
            }
          }
        );
      });

      const combinedOutput = `${stdout}${stderr}`
        .split("\n")
        .filter((line) => !line.includes(".parf_temp_files"))
        .join("\n");

      return { result: combinedOutput };
    }
  } catch (error) {
    console.error("Error in analyseFolder:", error);
    if (error instanceof Error && error.message.includes("Config file not found")) {
      throw new Error("未找到配置文件config.txt");
    } else if (error instanceof Error && error.message.includes("Error parsing config")) {
      throw new Error("配置文件格式错误");
    }
    throw new Error(
      `分析错误: ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
};

// 读取文件夹中所有文件的函数（只检查根目录的config.txt）
const readFolderFiles = async (folderPath: string, isRoot = true): Promise<{ path: string; content: string }[]> => {
  const result: { path: string; content: string }[] = [];
  const files = await fs.readdir(folderPath, { withFileTypes: true });
  
  // 如果是根目录，检查是否包含config.txt
  if (isRoot) {
    const hasConfigFile = files.some(file => file.name === 'config.txt' && !file.isDirectory());
    if (!hasConfigFile) {
      throw new Error('Root directory must include config.txt.');
    }
  }
  
  for (const file of files) {
    const filePath = path.join(folderPath, file.name);
    
    if (file.isDirectory()) {
      // 递归调用时，标记不是根目录
      const subFiles = await readFolderFiles(filePath, false);
      subFiles.forEach(subFile => {
        result.push({
          path: path.join(file.name, subFile.path),
          content: subFile.content,
        });
      });
    } else {
      // 读取文件内容
      const content = await fs.readFile(filePath, 'utf-8');
      result.push({ path: file.name, content });
    }
  }
  
  return result;
};



// 创建 API 路由
export const analyseRouter = createTRPCRouter({
  analyseFolder: publicProcedure
    .input(
      z.object({
        budget: z.number().min(1),
        process: z.number().min(1),
        sampleNum: z.number().min(1),
        fileId: z.string(),
      })
    )
    .output(z.object({ result: z.string() }))
    .mutation(async ({ input }) => {
      return new Promise<{ result: string }>((resolve, reject) => {
        commandQueue.push(input, (error: Error | null | undefined, result?: CommandResult) => {
          if (error != null) {
            return reject(error);
          }
          if (result && "result" in result) {
            resolve({ result: result.result });
          } else {
            reject(new Error("No result returned from analysis"));
          }
        });
      });
    }),

  getQueueLength: publicProcedure.query(() => {
    return { queueLength: commandQueue.length() };
  }),
});