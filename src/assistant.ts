import { assisBackend, assisVscode } from "assis-vscode";
import { Exception } from "./base/exception";

export const assistantCreate = ({ saveFolder }: { saveFolder: string }) => {
  return new assisBackend.Decision(
    new assisBackend.DecisionCore(),
    new assisBackend.ThinkLowdb("luoanb@163.com", saveFolder, Exception),
    assisVscode.useWorkspaceLowDB
  );
};
