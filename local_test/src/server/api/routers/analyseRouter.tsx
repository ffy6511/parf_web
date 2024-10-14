import { exec } from "child_process";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs/promises";
import path from "path";

export const analyseRouter = createTRPCRouter({
  executeCommand: publicProcedure
    .input(
      z.object({
        budget: z.number().min(1),
        process: z.number().min(1),
        sampleNum: z.number().min(1),
        fileContent: z.string(), // 添加文件内容字段
      })
    )
    .output(z.object({ result: z.string() }))
    .mutation(async ({ input }) => {
      const { budget, process, sampleNum, fileContent } = input;

      // 定义临时目录路径和临时文件路径
      const tempDirPath = path.join('.', '.parf_temp_files');
      const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const tempFilePath = path.join(tempDirPath, `analysis_${uniqueSuffix}.c`);

      // 确保临时目录存在（如果不存在则创建）
      try {
        await fs.mkdir(tempDirPath, { recursive: true }); // 确保目录存在
      } catch (mkdirError) {
        console.error(`Failed to create directory ${tempDirPath}`, mkdirError);
        throw new Error(`Failed to create directory ${tempDirPath}`);
      }

      try {
        // 使用异步方法写入文件内容
        await fs.writeFile(tempFilePath, fileContent);

        // 构建要执行的命令
        const command = `eval $(opam env) && frama-c ${tempFilePath} -parf -parf-budget ${budget} -parf-process ${process} -parf-sample-num ${sampleNum}`;

        // 执行命令并返回结果
        return new Promise<{ result: string }>((resolve, reject) => {
          exec(command, async (error, stdout, stderr) => {
            // 尝试删除临时文件
            try {
              await fs.unlink(tempFilePath);
            } catch (unlinkError) {
              console.error(`Failed to delete temporary file: ${tempFilePath}`, unlinkError);
            }

            // 如果命令执行有错误，返回错误信息，否则返回 stdout
            if (error) {
              reject(`Error: ${stderr || error.message}`);
            } else {
              resolve({ result: stdout });
            }
          });
        });
      } catch (error) {
        // 捕获文件写入错误
        if (error instanceof Error) {
          throw new Error(`File handling error: ${error.message}`);
        } else {
          throw new Error('File handling error: Unknown error');
        }
      }
    }),
});
