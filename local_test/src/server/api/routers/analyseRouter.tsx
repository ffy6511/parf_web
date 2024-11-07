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
};

// 定义结果类型
type CommandResult = { result: string };

// 创建一个队列，设置并发数为 1
const commandQueue = queue<ExecuteCommandInput, CommandResult>(
  async (task: ExecuteCommandInput) => {
    // 直接返回 executeCommand 的结果，queue 会自动处理 Promise
    return executeCommand(task);
  },
  1 // 设置并发数为 1，意味着每次只处理一个任务
);

// 实际的执行命令逻辑
const executeCommand = async ({ budget, process, sampleNum, fileContent }: ExecuteCommandInput): Promise<CommandResult> => {
  const tempFilePath = path.join(os.tmpdir(), `frama_c_input_${Date.now()}.c`);

  try {
    await fs.writeFile(tempFilePath, fileContent);

    const command = `opam switch 5.1.0 && eval $(opam env) && frama-c ${tempFilePath} -parf -parf-budget ${budget} -parf-process ${process} -parf-sample-num ${sampleNum}`;

    const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          reject(error); // 如果有错误，则拒绝 Promise
        } else {
          resolve({ stdout, stderr });
        }
      });
    });

    await fs.unlink(tempFilePath).catch(() => {});

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
      })
    )
    .output(z.object({ result: z.string() }))
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

    getQueueLength: publicProcedure.query(() => {
      return { queueLength: commandQueue.length() };
    }),
});
