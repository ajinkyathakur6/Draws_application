import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function StudentsPage() {
  const role = localStorage.getItem("role");
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const [students, setStudents] = useState([]);
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");

  const loadStudents = async () => {
    const res = await api.get("/students");
    setStudents(res.data);
  };

  const addStudent = async () => {
    if (!rollNo || !name) {
      alert("Roll No and Name are required");
      return;
    }

    await api.post("/students", {
      rollNo,
      name,
      department,
      year,
    });

    setRollNo("");
    setName("");
    setDepartment("");
    setYear("");
    loadStudents();
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <>
      <Navbar role={role} />

      <div className="p-3 md:p-6 min-h-screen bg-gray-50">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Students Master</h1>

        {/* Add Student */}
        <div className="border p-3 md:p-4 rounded mb-6 bg-white">
          <h2 className="font-bold mb-3 text-sm md:text-base">Add Student</h2>

          <div className="flex flex-col gap-2">
            <input
              className="border p-2 text-xs md:text-sm rounded"
              placeholder="Roll No"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
            />
            <input
              className="border p-2 text-xs md:text-sm rounded"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border p-2 text-xs md:text-sm rounded"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <input
              className="border p-2 text-xs md:text-sm rounded"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />

            <button
              className="bg-green-600 text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded hover:bg-green-700"
              onClick={addStudent}
            >
              Add Student
            </button>
          </div>
        </div>

        {/* Bulk Upload */}
        <div className="border p-3 md:p-4 rounded mb-6 bg-white">
          <h2 className="font-bold mb-3 text-sm md:text-base">Bulk Upload (CSV)</h2>

          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="flex-1 text-xs md:text-sm"
            />

            <button
              className="bg-blue-600 text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded hover:bg-blue-700 whitespace-nowrap"
              onClick={async () => {
                if (!file) {
                  alert("Please select a CSV file");
                  return;
                }

                const formData = new FormData();
                formData.append("file", file);

                const res = await api.post(
                  "/students/bulk-upload",
                  formData,
                  { headers: { "Content-Type": "multipart/form-data" } }
                );

                setUploadResult(res.data);
                setFile(null);
                loadStudents();
              }}
            >
              Upload
            </button>
          </div>

            {uploadResult && (
              <div className="mt-3 text-xs md:text-sm p-3 bg-gray-50 rounded border">
                <div className="text-green-700 font-semibold">
                  ✓ Inserted: {uploadResult.inserted}
                </div>
                <div className="text-yellow-700">
                  ⚠ Skipped (duplicates): {uploadResult.skipped}
                </div>
                {uploadResult.errors.length > 0 && (
                  <div className="text-red-600">
                    ✗ Errors: {uploadResult.errors.length}
                  </div>
                )}
              </div>
            )}
        </div>


        {/* Students List */}
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
            {students.map((s) => (
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
      </div>
    </>
  );
}
