import "@logseq/libs";
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

const main = () => {
  console.log("### In main()");
  logseq.Editor.registerSlashCommand("Copy page properties to new page", async () => {
    CopyPropertiesToNewPage();
  });
  logseq.Editor.registerBlockContextMenuItem("Copy page properties to new page", async () => {
    CopyPropertiesToNewPage();
  });
  logseq.Editor.registerSlashCommand("Copy page properties to linked page", async (e) => {
    CopyPropertiesToPage(e.uuid);
  });
  logseq.Editor.registerBlockContextMenuItem("Copy page properties to linked page", async (e) => {
    CopyPropertiesToPage(e.uuid);
  });
};

async function CopyPropertiesToNewPage() {
  var currentPageProperties = await GetPageProperties();
  var newPage = await logseq.Editor.createPage(getTimestamp(), { }, {
    redirect: true
  });
  var newPageBlockstree: BlockEntity[] = await logseq.Editor.getPageBlocksTree(newPage!.uuid);
  logseq.Editor.updateBlock(newPageBlockstree[0]!.uuid, currentPageProperties);
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

async function CopyPropertiesToPage(blockId: string) {
  const block = await logseq.Editor.getBlock(blockId, {
    includeChildren: false,
  });
  if (block === null) {
    return;
  }
  const line = block.content;
  const match = line.match(/\[\[(.*?)\]\]/);
  if (match) {
    var currentPageProperties = await GetPageProperties();
    var linkedPageName = match[1];
    var linkedPage = await logseq.Editor.getPage(linkedPageName);
    var linkedPageBlocksTree = await logseq.Editor.getPageBlocksTree(linkedPageName);
    if (linkedPageBlocksTree[0] !== undefined) {
      logseq.Editor.insertBlock(linkedPageBlocksTree[0]!.uuid, currentPageProperties, {
        before: true
      });
    } 
    else {
      logseq.Editor.insertBlock(linkedPage!.uuid, currentPageProperties, {
        before: false
      });
    }
  }
}

async function GetPageProperties() {
  var blocksTree: BlockEntity[] = await logseq.Editor.getCurrentPageBlocksTree();
  var properties = await logseq.Editor.getBlockProperties(blocksTree[0]!.uuid);
  var propertiesAry: string[] = [];
  for (let key in properties) {
    if (properties.hasOwnProperty(key)) {
      if (key !== "alias") {
        var property = key + ":: " + properties[key];
        propertiesAry.push(property);
      }
    }
  }
  return propertiesAry.join("\n");
}

logseq.ready(main).catch(console.error);
