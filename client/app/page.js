"use client";

import { useState } from "react";

const STEPS = {
  UPLOAD: "UPLOAD",
  PREVIEW: "PREVIEW",
  RESULTS: "RESULTS",
};

export default function GrowEasyImporter() {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResult, setAiResult] = useState(null);

const handleFile = (selectedFile) => {
  if (!selectedFile || !selectedFile.name.toLowerCase().endsWith(".csv")) {
    setError("Please upload a valid CSV spreadsheet file.");
    return;
  }
  setFile(selectedFile);
  setError(null);

  const reader = new FileReader();
  const previewChunk = selectedFile.slice(0, 1024 * 50); 
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length > 0) {
      const headers = lines[0].split(",").map(h => h.trim());
      const rows = lines.slice(1, 11).map(row => row.split(","));
      setRawHeaders(headers);
      setRawRows(rows);
      setStep(STEPS.PREVIEW); 
    }
  };
  reader.readAsText(previewChunk);
};

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("csvfile", file);

    try {
      const response = await fetch("http://localhost:5000/api/v1/csvimpoter/import", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Gemini AI extraction pipeline failed.");
      }

      setAiResult(resData.data);
      setStep(STEPS.RESULTS);
    } catch (err) {
      setError(err.message || "A networking error interrupted the conversion process.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setRawHeaders([]);
    setRawRows([]);
    setAiResult(null);
    setError(null);
    setStep(STEPS.UPLOAD);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "SALE_DONE": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "GOOD_LEAD_FOLLOW_UP": return "bg-sky-50 text-sky-800 border-sky-200";
      case "DID_NOT_CONNECT": return "bg-amber-50 text-amber-800 border-amber-200";
      case "BAD_LEAD": return "bg-rose-50 text-rose-800 border-rose-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-gray-800 p-6 md:p-12 font-sans">
      <div className="mx-auto space-y-8 max-w-7xl">
        <div className="flex flex-col pb-5 border-b border-gray-200 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
              <span className="font-serif italic text-emerald-600">GrowEasy</span> AI CSV Importer
            </h1>
            <p className="mt-1 text-sm text-gray-500">Intelligently map, clean, and align chaotic spreadsheets using organic data tuning.</p>
          </div>
          {step !== STEPS.UPLOAD && (
            <button onClick={handleReset} className="px-4 py-2 mt-4 text-sm font-medium text-gray-600 transition bg-white border border-gray-300 shadow-xs md:mt-0 rounded-xl hover:bg-gray-50">
              Reset Pipeline
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 text-sm border rounded-xl border-rose-200 bg-rose-50/50 text-rose-700">
            <span className="font-semibold">Pipeline Interrupted:</span> {error}
          </div>
        )}

        {step === STEPS.UPLOAD && (
          <div className="max-w-xl mx-auto mt-12">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
                isDragging ? "border-emerald-500 bg-emerald-50/40" : "border-gray-300 bg-white hover:border-emerald-400"
              }`}
            >
              <div className="p-4 mb-4 rounded-full bg-emerald-50 text-emerald-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <input type="file" accept=".csv" id="file-picker" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              <label htmlFor="file-picker" className="space-y-2 cursor-pointer">
                <p className="text-base font-semibold text-gray-900">
                  Drop your file here or <span className="text-emerald-600 hover:underline">browse storage</span>
                </p>
                <p className="text-xs text-gray-400">Accepts chaotic lead logs, marketing raw formats, and local spreadsheets</p>
              </label>
            </div>
          </div>
        )}

        {step === STEPS.PREVIEW && !loading && (
          <div className="p-6 space-y-4 bg-white border border-gray-200 shadow-xs rounded-2xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step 2: Structural Data Map</h2>
                <p className="text-xs text-gray-500 mt-0.5">Safely pulling structures from <span className="font-semibold text-emerald-700">{file?.name}</span>. Server resources remain resting.</p>
              </div>
              <button onClick={handleConfirmImport} className="inline-flex items-center justify-center bg-[#232625] hover:bg-[#1c862a] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all duration-150 transform active:scale-98">
                Confirm & Match AI Schema
              </button>
            </div>

            <div className="overflow-auto max-h-[400px] border border-gray-100 rounded-xl">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/70">
                  <tr>
                    {rawHeaders.map((header, i) => (
                      <th key={i} className="px-5 py-3 font-semibold tracking-wider text-gray-600 uppercase border-r border-gray-200 bg-gray-50">{header || `Column ${i + 1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {rawRows.map((row, rIdx) => (
                    <tr key={rIdx} className="transition hover:bg-emerald-50/20">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-5 py-3 text-gray-600 border-r border-gray-100 font-mono text-[11px]">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white border border-gray-200 shadow-xs rounded-2xl">
            <div className="relative flex items-center justify-center">
              <div className="rounded-full h-14 w-14 animate-spin border-3 border-emerald-600 border-t-transparent"></div>
              <div className="absolute text-emerald-600 font-semibold text-[9px] uppercase tracking-wider animate-pulse">LLM</div>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-sm font-semibold text-gray-900">Harmonizing Chaotic Text Inputs...</p>
              <p className="max-w-xs px-4 text-xs text-gray-400">Gemini is translating statuses, formatting locale country numbers, and structuralizing entities.</p>
            </div>
          </div>
        )}

       
        {step === STEPS.RESULTS && aiResult && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-5 bg-white border border-gray-200 shadow-xs rounded-xl">
                <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Rows Tracked</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{(aiResult.totalImported || 0) + (aiResult.totalSkipped || 0)}</p>
              </div>
              <div className="p-5 bg-white border border-gray-200 shadow-xs rounded-xl">
                <p className="text-xs font-semibold tracking-wider uppercase text-emerald-600">Cleaned & Aligned</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600">{aiResult.totalImported || 0}</p>
              </div>
              <div className="p-5 bg-white border border-gray-200 shadow-xs rounded-xl">
                <p className="text-xs font-semibold tracking-wider uppercase text-amber-600">Skipped (No Context)</p>
                <p className="mt-2 text-3xl font-bold text-amber-600">{aiResult.totalSkipped || 0}</p>
              </div>
              <div className="p-5 border shadow-xs rounded-xl border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white">
                <p className="text-xs font-semibold tracking-wider uppercase text-emerald-700">Validation Quality</p>
                <p className="mt-2 text-sm font-bold text-emerald-900">Active Gemini Core</p>
              </div>
            </div>

           
            <div className="overflow-hidden bg-white border border-gray-200 shadow-xs rounded-2xl">
              <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
                <h3 className="text-base font-bold text-gray-900">Synchronized Lead Index</h3>
                <p className="text-xs text-gray-400">Structured outputs polished and prepared for immediate target system delivery.</p>
              </div>
              
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-10 font-semibold tracking-wider text-gray-600 uppercase border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 bg-gray-50">Lead Details</th>
                      <th className="px-6 py-3.5 bg-gray-50">Contact Points</th>
                      <th className="px-6 py-3.5 bg-gray-50">CRM Assignment Status</th>
                      <th className="px-6 py-3.5 bg-gray-50">Standardized Location</th>
                      <th className="px-6 py-3.5 bg-gray-50">Corporate Context</th>
                      <th className="px-6 py-3.5 bg-gray-50">Owner Handshake</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {aiResult.records?.map((lead, idx) => (
                      <tr key={idx} className="transition hover:bg-emerald-50/10">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {lead.name || "N/A"}
                          <div className="text-[10px] text-gray-400 font-normal mt-0.5 font-mono">{lead.created_at || "—"}</div>
                        </td>
                        <td className="px-6 py-4 space-y-0.5">
                          <div className="font-medium text-gray-900">{lead.email || "—"}</div>
                          <div className="text-gray-400 font-mono text-[11px]">{lead.country_code} {lead.mobile_without_country_code || "—"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-2xs ${getStatusBadge(lead.crm_status)}`}>
                            {lead.crm_status ? lead.crm_status.replace(/_/g, " ") : "UNMAPPED"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {lead.city || "—"}
                          {lead.state && <span className="text-gray-400 text-[11px]">, {lead.state}</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="font-medium text-gray-800">{lead.company || "—"}</span>
                          <div className="text-[10px] text-gray-400 max-w-[180px] truncate capitalize mt-0.5">{lead.data_source ? lead.data_source.replace(/_/g, " ") : "unspecified"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-gray-600">{lead.lead_owner || "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}