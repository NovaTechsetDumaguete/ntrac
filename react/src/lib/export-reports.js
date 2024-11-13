import axiosClient from "@/lib/axios-client";
import moment from "moment";
import * as XLSX from "xlsx";

export async function exportTracking(reportId, filename = null) {
  const { data } = await axiosClient("/reports/download", {
    params: {
      reportId: reportId,
      moduleType: "tracking",
    },
  });

  const formatedData = formatData(data.data);

  const worksheet = XLSX.utils.json_to_sheet(formatedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "tracking");
  XLSX.writeFile(
    workbook,
    filename ?? `nTrac-Tracking-Reports-${moment().unix()}.xlsx`
  );
}

const formatData = (data) => {
  return data.map((x) => {
    let onDuty =
      moment(x.date).isSame(moment(), "day") && x.time_out === null
        ? moment().diff(moment(x.time_in, "HH:mm:ss"), "seconds")
        : moment(x.time_out, "HH:mm:ss").diff(
            moment(x.time_in, "HH:mm:ss"),
            "seconds"
          );

    let idle =
      onDuty -
      (x.productive_duration + x.unproductive_duration + x.neutral_duration);
    return {
      ID: x.employee.employee_id,
      DATE: x.date,
      EMPLOYEE: `${x.employee.last_name}, ${x.employee.first_name}`,
      PRODUCTIVE: parseFloat(x.productive_duration / 3600).toFixed(2),
      UNPRODUCTIVE: parseFloat(x.unproductive_duration / 3600).toFixed(2),
      NEUTRAL: parseFloat(x.neutral_duration / 3600).toFixed(2),
      IDLE: parseFloat(idle / 3600).toFixed(2),
      "TOTAL-WORK-TIME": parseFloat(onDuty / 3600).toFixed(2),
      TIMEIN: x.time_in,
      TIMEOUT: x.time_out,
    };
  });
};
