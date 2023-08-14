import * as vscode from "vscode";
import {Provider} from "../../ioc/provider";
import {CommandsFlags, FLAG_NO_GROUP, TelemetryEventIds} from "../../constants/flags";
import {VirtualMachineProvider} from "../virtual_machine";
import {LogService} from "../../services/logService";
import {VirtualMachineTreeItem} from "../virtual_machine_item";

export function registerRemoveGroupCommand(context: vscode.ExtensionContext, provider: VirtualMachineProvider) {
  context.subscriptions.push(
    vscode.commands.registerCommand(CommandsFlags.treeRemoveGroup, async (item: VirtualMachineTreeItem) => {
      const group = Provider.getConfiguration().getVirtualMachineGroup(item.id);
      if (group !== undefined) {
        const options: string[] = ["Yes", "No"];
        const confirmation = await vscode.window.showQuickPick(options, {
          placeHolder: `Are you sure you want to remove group ${item.name}?`
        });
        if (confirmation === "Yes") {
          const noGroup = Provider.getConfiguration().getVirtualMachineGroup(FLAG_NO_GROUP);
          group.machines.forEach(vm => {
            noGroup?.addVm(vm);
          });
          Provider.getConfiguration().deleteVirtualMachineGroup(item.id);
          vscode.commands.executeCommand(CommandsFlags.treeRefreshVms);
          LogService.info(`Group ${item.name} removed`);
          LogService.sendTelemetryEvent(TelemetryEventIds.GroupAction, `Group ${item.name} removed`);
        }
      }
    })
  );
}
