import { exec } from "child_process";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { queue } from "async";

// 定义输入类型
type ExecuteCommandInput = {
  budget: number;
  process: number;
  sampleNum: number;
  fileContent: string;
  tempDirPath: string;
};

// 新增文件夹分析的输入类型
type FolderAnalyseInput = {
  budget: number;
  process: number;
  sampleNum: number;
  files: {
    path: string;
    content: string;
  }[];
  folderPath: string;
  tempDirPath: string;
};


// 定义结果类型
type CommandResult = { 
  result: string ;
};

// 创建队列
const commandQueue = queue(async (task: ExecuteCommandInput | FolderAnalyseInput) => {
 //async
  if ('files' in task) {
    return analyseFolderFiles(task);
  }
  return executeCommand(task);
}, 1);

// 文件夹分析函数
const analyseFolderFiles = async ({ budget, process, sampleNum, files, folderPath,tempDirPath }: FolderAnalyseInput): Promise<CommandResult> => {
  
  try {
    // 创建临时目录
    await fs.mkdir(tempDirPath, { recursive: true });

    // 写入所有文件并寻找config.txt
    let configContent = '';
    for (const file of files) {
      const filePath = path.join(tempDirPath, file.path);
      // 确保文件的目录存在
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, file.content);

      // 检查是否是config.txt文件
      if (file.path.endsWith('config.txt')) {
        configContent = file.content.trim();
      }
    }

    if (!configContent) {
      throw new Error('Config file not found in the folder');
    }


    // 构建命令
    let command: string;
    try {
      // 使用config.txt中的内容构建命令
      command = `opam switch 5.1.0 && eval $(opam env) && frama-c ${configContent} -parf -parf-budget ${budget} -parf-process ${process} -parf-sample-num ${sampleNum}`;
    } catch (error) {
      throw new Error(`Error parsing config file: ${error}`);
    }


    // 执行命令
    const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(command, 
        { 
          maxBuffer: 1024 * 1024 * 10,
          cwd: tempDirPath // 设置工作目录为临时目录
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

    // 清理临时文件
    //await fs.rm(tempDirPath, { recursive: true, force: true });

    const combinedOutput = `${stdout}${stderr}`
      .split('\n')
      .filter(line => !line.includes('.parf_temp_files'))
      .join('\n');

    return {
       result: combinedOutput,

     };
  } catch (error) {
    // 确保清理临时文件
    //await fs.rm(tempDirPath, { recursive: true, force: true }).catch(() => {});
    console.error('Error in analyseFolderFiles:', error);
    if (error instanceof Error && error.message.includes('Config file not found')) {
      throw new Error('未找到配置文件config.txt');
    } else if (error instanceof Error && error.message.includes('Error parsing config')) {
      throw new Error('配置文件格式错误');
    }
    throw new Error(`文件夹分析错误: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
};


// 实际的执行命令逻辑
const executeCommand = async ({ budget, process, sampleNum, fileContent,tempDirPath }: ExecuteCommandInput): Promise<CommandResult> => {
  const fullTempPath = path.join(os.tmpdir(), tempDirPath);
  const tempFilePath = path.join(fullTempPath, 'input.c');

  try {
    await fs.writeFile(tempFilePath, fileContent);

    const command = `opam switch 5.1.0 && eval $(opam env) && frama-c ${tempFilePath} -parf -parf-budget ${budget} -parf-process ${process} -parf-sample-num ${sampleNum}`;

    const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      //设置文件的最大容量：当前:10 MB
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          reject(error); // 如果有错误，则拒绝 Promise
        } else {
          resolve({ stdout, stderr });
        }
      });
    });


    const combinedOutput = `${stdout}${stderr}`
      .split('\n')
      .filter(line => !line.includes('.parf_temp_files'))
      .join('\n');

    return { result: combinedOutput };
  } catch (error) {
    console.error('Error in executeCommand:', error);
    throw new Error(`Command execution error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
};

// 创建 API 路由
export const analyseRouter = createTRPCRouter({
  executeCommand: publicProcedure
    .input(
      z.object({
        budget: z.number().min(1),
        process: z.number().min(1),
        sampleNum: z.number().min(1),
        fileContent: z.string(),
        tempDirPath: z.string(),
      })
    )
    .output(z.object({
       result: z.string() ,
      }))
    .mutation(async ({ input }) => {
      return new Promise<{ result: string }>((resolve, reject) => {
        // 将任务添加到队列
        commandQueue.push(input, (error: Error | null | undefined, result?: CommandResult) => {
          if (error != null) { // 使用 != 来同时检查 null 和 undefined
            return reject(error);
          }
          if (result) {
            resolve(result);
          } else {
            reject(new Error('No result returned from command execution'));
          }
        });
      });
    }),

    // 新增的文件夹分析接口
    analyseFolder: publicProcedure
    .input(
      z.object({
        budget: z.number().min(1),
        process: z.number().min(1),
        sampleNum: z.number().min(1),
        files: z.array(
          z.object({
            path: z.string(),
            content: z.string(),
          })
        ),
        folderPath: z.string(),
        tempDirPath: z.string(),
      })
    )
    .output(z.object({ result: z.string() }))
    .mutation(async ({ input }) => {
      return new Promise<{ result: string }>((resolve, reject) => {
        commandQueue.push(input, (error, result) => {
          if (error != null) {
            return reject(error);
          }
          if (result) {
            resolve(result);
          } else {
            reject(new Error('No result returned from folder analysis'));
          }
        });
      });
    }),


    getQueueLength: publicProcedure.query(() => {
      return { queueLength: commandQueue.length() };
    }),
});
