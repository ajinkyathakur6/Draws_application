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

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Students Master</h1>

        {/* Add Student */}
        <div className="border p-4 rounded mb-6">
          <h2 className="font-bold mb-2">Add Student</h2>

          <input
            className="border p-2 mr-2"
            placeholder="Roll No"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
          />
          <input
            className="border p-2 mr-2"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2 mr-2"
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <input
            className="border p-2 mr-2"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          <button
            className="bg-green-600 text-white px-4 py-2"
            onClick={addStudent}
          >
            Add
          </button>
        </div>

        {/* Bulk Upload */}
<div className="border p-4 rounded mb-6">
  <h2 className="font-bold mb-2">Bulk Upload (CSV)</h2>

  <input
    type="file"
    accept=".csv"
    onChange={(e) => setFile(e.target.files[0])}
  />

  <button
    className="bg-blue-600 text-white px-4 py-2 ml-2"
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

  {uploadResult && (
    <div className="mt-2 text-sm">
      <div className="text-green-700">
        Inserted: {uploadResult.inserted}
      </div>
      <div className="text-yellow-700">
        Skipped (duplicates): {uploadResult.skipped}
      </div>
      {uploadResult.errors.length > 0 && (
        <div className="text-red-600">
          Errors: {uploadResult.errors.length}
        </div>
      )}
    </div>
  )}
</div>


        {/* Students List */}
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
            {students.map((s) => (
              <tr key={s._id}>
                <td className="border p-2">{s.rollNo}</td>
                <td className="border p-2">{s.name}</td>
                <td className="border p-2">{s.department}</td>
                <td className="border p-2">{s.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
