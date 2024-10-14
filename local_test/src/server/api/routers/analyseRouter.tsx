import { exec } from "child_process";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs/promises";
import os from "os";
import path from "path";

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
      const { budget, process, sampleNum, fileContent } = input;

      const tempFilePath = path.join(os.tmpdir(), `frama_c_input_${Date.now()}.c`);

      try {
        await fs.writeFile(tempFilePath, fileContent);

        const command = `opam switch 5.1.0 && eval $(opam env) && frama-c ${tempFilePath} -parf -parf-budget ${budget} -parf-process ${process} -parf-sample-num ${sampleNum}`;

        const { stdout, stderr } = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
          exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
            // 即使有错误也解析输出，因为我们想要看到 Frama-c 的分析结果
            resolve({ stdout, stderr });
          });
        });

        await fs.unlink(tempFilePath).catch(() => {});

        // 合并 stdout 和 stderr，但过滤掉无关的错误信息
        const combinedOutput = `${stdout}\n\nWarnings/Errors:\n${stderr}`
          .split('\n')
          .filter(line => !line.includes('.parf_temp_files'))
          .join('\n');

        return { result: combinedOutput };
      } catch (error) {
        console.error('Error in executeCommand:', error);
        throw new Error(`Command execution error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      }
    }),
});