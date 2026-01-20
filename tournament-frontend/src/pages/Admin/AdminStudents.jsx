import { useEffect, useState } from "react";
import api from "../../api/api";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);

  const loadStudents = async () => {
    const res = await api.get("/students");
    setStudents(res.data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Students Master</h1>

      {/* Bulk Upload */}
      <div className="border p-3 md:p-4 rounded mb-6 bg-white">
        <h2 className="font-bold mb-3 text-sm md:text-base">Bulk Upload (CSV)</h2>

        <div className="flex flex-col md:flex-row gap-2">
          <input 
            type="file" 
            accept=".csv" 
            onChange={e=>setFile(e.target.files[0])} 
            className="flex-1 text-xs md:text-sm border p-2 rounded"
          />

          <button
            className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded text-xs md:text-sm whitespace-nowrap hover:bg-blue-700"
            onClick={async () => {
              const formData = new FormData();
              formData.append("file", file);
              await api.post("/students/bulk-upload", formData);
              loadStudents();
            }}
          >
            Upload
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-white rounded border">
      <table className="w-full border-collapse">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2 md:p-3 text-xs md:text-sm text-left font-semibold">Roll No</th>
            <th className="border p-2 md:p-3 text-xs md:text-sm text-left font-semibold">Name</th>
            <th className="border p-2 md:p-3 text-xs md:text-sm text-left font-semibold">Department</th>
            <th className="border p-2 md:p-3 text-xs md:text-sm text-left font-semibold">Year</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id} className="hover:bg-gray-50">
              <td className="border p-2 md:p-3 text-xs md:text-sm">{s.rollNo}</td>
              <td className="border p-2 md:p-3 text-xs md:text-sm">{s.name}</td>
              <td className="border p-2 md:p-3 text-xs md:text-sm">{s.department}</td>
              <td className="border p-2 md:p-3 text-xs md:text-sm">{s.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
