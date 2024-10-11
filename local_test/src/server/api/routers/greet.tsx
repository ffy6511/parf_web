// src/server/pythonRunner.ts
import { exec } from 'child_process';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import path from 'path';

// 运行 Python 脚本的函数
export const runPythonScript = (name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 使用 path.resolve 获取 hello.py 的绝对路径
    const scriptPath = path.resolve(process.cwd(), 'hello.py'); // 更改此行
    // 构建命令
    const command = `python "${scriptPath}" "${name}"`; // 确保路径和参数都被引号包围以处理空格

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Error: ${stderr || error.message}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
};

// 定义 greet 路由
export const greetRouter = createTRPCRouter({
  greet: publicProcedure
    .input(z.object({ name: z.string().min(1, "Name is required") }))
    .mutation(async ({ input }) => {
      try {
        const greeting = await runPythonScript(input.name);
        return { greeting };
      } catch (error) {
        throw new Error(typeof error === 'string' ? error : 'Unknown error');
      }
    }),
});
