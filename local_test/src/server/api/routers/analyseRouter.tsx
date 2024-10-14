import { exec } from "child_process";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs/promises"; // 使用异步的 fs 模块
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

      // 使用时间戳加随机数生成唯一文件名
      const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const tempFilePath = path.join("/tmp", `analysis_${uniqueSuffix}.c`);

      try {
        // 使用异步方法写入文件，避免阻塞事件循环
        await fs.writeFile(tempFilePath, fileContent);

        // 构建命令
        const command = `eval $(opam env) && frama-c ${tempFilePath} -parf -parf-budget ${budget} -parf-process ${process} -parf-sample-num ${sampleNum}`;

        // 执行命令并返回结果
        return new Promise<{ result: string }>((resolve, reject) => {
          exec(command, async (error, stdout, stderr) => {
            // 确保文件在命令执行后被删除
            try {
              await fs.unlink(tempFilePath);
            } catch (unlinkError) {
              console.error(`Failed to delete temporary file: ${tempFilePath}`, unlinkError);
            }

            // 处理命令执行结果
            if (error) {
              reject(`Error: ${stderr || error.message}`);
            } else {
              resolve({ result: stdout });
            }
          });
        });

      } catch (error) {
        // 处理文件写入错误
        if (error instanceof Error) {
          throw new Error(`File handling error: ${error.message}`);
        } else {
          throw new Error('File handling error: Unknown error');
        }
      }
    }),
});
