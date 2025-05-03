import fs from "fs";
import { getPromise } from "assis-general";

/**
 * 按照utf-8格式读取文件
 * @param filePath
 * @returns
 */
export const readFileAsString = (
  filePath: any,
  encoding: BufferEncoding = "utf-8"
) => {
  const res = getPromise<string>();
  fs.readFile(filePath, encoding, (err, data) => {
    // 如果出错，打印错误信息
    if (err) {
      res.reject(err);
    } else {
      res.reslove(data);
    }
  });
  return res.promise;
};
