// import { alignment, defaultDataType } from "export-xlsx";

export const ATTENDANCE_SETTINGS = {
  fileName: "nTrac-Attendance-Report",
  workSheets: [
    {
      sheetName: "Attendance-Report",
      startingRowNumber: 2,
      gapBetweenTwoTables: 2,
      tableSettings: {
        data: {
          tableTitle: "Attendance Report",
          headerGroups: [
            // {
            //   name: '',
            //   key: 'void',
            //   groupKey: 'directions',
            // },
            // {
            //   name: 'Science',
            //   key: 'science',
            //   groupKey: 'directions',
            // },
            // {
            //   name: 'Directions',
            //   key: 'directions',
            // },
          ],
          headerDefinition: [
            {
              name: "#",
              key: "employeeId",
            },
            {
              name: "Name",
              key: "name",
            },
            {
              name: "Time-in",
              key: "timeIn",
            },
            {
              name: "Time-out",
              key: "timeOut",
            },
            {
              name: "Late",
              key: "late",
            },
            {
              name: "Undertime",
              key: "undertime",
            },
            {
              name: "Total Worked Hours",
              key: "totalHrs",
            },
          ],
        },
      },
    },

  ],
};

export const SETTINGS_FOR_EXPORT = {
  fileName: 'example',
  workSheets: {
    sheetName: 'example',
    startingRowNumber: 2,
    gapBetweenTwoTables: 2,
    tableSettings: {
      table1: {
        tableTitle: "Score",
        headerGroups: [
          {
            name: '',
            key: 'void',
            groupKey: 'directions',
          },
          {
            name: 'Science',
            key: 'science',
            groupKey: 'directions',
          },
          {
            name: 'Directions',
            key: 'directions',
          },
        ],
        headerDefinition: [
          {
            name: '#',
            key: 'number',
          },
          {
            name: 'Name',
            key: 'name',
          },
          {
            name: 'SUM',
            key: 'sum',
            groupKey: 'void',
            rowFormula: '{math}+{physics}+{chemistry}+{informatics}+{literature}+{foreignLang}',
          },
          {
            name: 'Mathematics',
            key: 'math',
            groupKey: 'science',
          },
          {
            name: 'Physics',
            key: 'physics',
            groupKey: 'science',
          },
          {
            name: 'Chemistry',
            key: 'chemistry',
            groupKey: 'science',
          },
          {
            name: 'Informatics',
            key: 'informatics',
            groupKey: 'science',
          },
          {
            name: 'Literature',
            key: 'literature',
            groupKey: 'science',
          },
          {
            name: 'Foreign lang.',
            key: 'foreignLang',
            groupKey: 'science',
          },
          {
            name: 'AVG',
            key: 'avg',
            groupKey: 'void',
            rowFormula: '{sum}/6',
          }
        ],
      }
    }
  },
};
