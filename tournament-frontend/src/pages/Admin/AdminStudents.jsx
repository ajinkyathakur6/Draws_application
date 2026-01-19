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
      <h1 className="text-2xl font-bold mb-4">Students Master</h1>

      {/* Bulk Upload */}
      <div className="border p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Bulk Upload (CSV)</h2>

        <input type="file" accept=".csv" onChange={e=>setFile(e.target.files[0])} />

        <button
          className="bg-blue-600 text-white px-4 py-2 ml-2"
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

      {/* Students Table */}
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Roll No</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Year</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td className="border p-2">{s.rollNo}</td>
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">{s.department}</td>
              <td className="border p-2">{s.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
