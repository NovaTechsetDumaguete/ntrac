// import { Button } from "@/components/ui/button";
// import { Tooltip } from "@/components/ui/tooltip";
// import { TooltipContent } from "@radix-ui/react-tooltip";
// import * as FileSaver from "file-saver";
// import XLSX from "sheetjs-style";


// const fileType =
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
// const fileExtension = ".xlsx";


// export async function exportToExcel({ excelData, fileName }) {
//   const ws = XLSX.utils.json_to_sheet(excelData);
//   const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
//   const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//   const data = new Blob([excelBuffer], { type: fileType });
//   FileSaver.saveAs(data, fileName + fileExtension);
// };
// return <Button onClick={exportToExcel}> Export</Button>;
// };



