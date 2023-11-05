import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

const settings: any = [];

const main = () => {
  console.log("### In main()");
  logseq.Editor.registerSlashCommand("Copy page properties to new note", async () => {
    CopyPage();
  });
  logseq.Editor.registerBlockContextMenuItem("Copy page properties to new note", async () => {
    CopyPage();
  });
};

async function CopyPage() {
  var blockstree: BlockEntity[] = await logseq.Editor.getCurrentPageBlocksTree();
  var properties = await logseq.Editor.getBlockProperties(blockstree[0]!.uuid);
  var newPage = await logseq.Editor.createPage(getTimestamp(), { }, {
    redirect: true
  });
  var newPageBlockstree: BlockEntity[] = await logseq.Editor.getPageBlocksTree(newPage!.uuid);
  var propertiesAry: string[] = [];
  for (let key in properties) {
    if (properties.hasOwnProperty(key)) {
      var propertiesStr = key + ":: " + properties[key];
      propertiesAry.push(propertiesStr);
    }
  }
  var propertiesStr = propertiesAry.join("\n");
  logseq.Editor.updateBlock(newPageBlockstree[0]!.uuid, propertiesStr);
  logseq.Editor.exitEditingMode();
}

function getTimestamp(): string {
  let date = new Date()
  let yyyy = date.getFullYear();
  let MM: number | string = date.getMonth()+1;
  let dd: number | string = date.getDate();
  let hh: number | string = date.getHours();
  let mm: number | string = date.getMinutes();
  let ss: number | string = date.getSeconds();
  if (MM < 10) { MM = "0" + MM; }
  if (dd < 10) { dd = "0" + dd; }
  if (hh < 10) { hh = "0" + hh; }
  if (mm < 10) { mm = "0" + mm; }
  if (ss < 10) { ss = "0" + ss; }
  let timestamp = `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`;

  return timestamp;
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error);
