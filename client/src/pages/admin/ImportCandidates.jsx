import React, { useState, useRef } from 'react';
import { importSpreadsheet } from '../../api/importApi';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Info,
  X,
  FileText
} from 'lucide-react';

export const ImportCandidates = () => {
  const [file, setFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const EXPECTED_MAPPINGS = [
    { target: 'Email ID', forms: ['Email', 'Email Address', 'Email ID', 'Username'] },
    { target: 'Phone No.', forms: ['Phone Number', 'Phone', 'Contact Number', 'Mobile'] },
    { target: 'Roll Number', forms: ['Roll Number', 'Roll No', 'Hall Ticket Number', 'HT No'] },
    { target: 'Year of Study', forms: ['Year of Study', 'Year', 'Current Year'] },
    { target: 'Branch', forms: ['Branch/Department', 'Branch', 'Department', 'Stream'] },
    { target: 'Section', forms: ['Section', 'Sec', 'Class Section'] },
    { target: 'Preferred Domain', forms: ['Preferred domain/team', 'Preferred Domain', 'Domain'] },
    { target: 'Why GDGoC', forms: ['Why do you want to join GDGoC?', 'Why GDGoC?'] },
    { target: 'Why Domain', forms: ['Why are you interested in this particular domain?', 'Why this domain?'] },
    { target: 'Experience', forms: ['Prior experience or knowledge', 'Prior Experience'] },
    { target: 'Open to other domain?', forms: ['Open to another domain?', 'Are you open to another domain?'] },
    { target: 'Contribution', forms: ['How can you contribute to GDGoC VJIT?', 'Contribution'] },
    { target: 'LinkedIn / GitHub / Portfolio', forms: ['LinkedIn URL', 'GitHub URL', 'Other portfolio links'] }
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError('');
    setResult(null);

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setError('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);
    setFileDetails({
      name: selectedFile.name,
      size: (selectedFile.size / 1024).toFixed(1) + ' KB',
      type: selectedFile.type || 'Spreadsheet file'
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a spreadsheet file first.');
      return;
    }

    setError('');
    setUploading(true);
    setResult(null);

    try {
      const res = await importSpreadsheet(file);
      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to import spreadsheet.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileDetails(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#171717]">Import Candidates</h2>
        <p className="text-xs text-[#737373] mt-1">
          Ingest Google Forms response spreadsheets with automated fuzzy column mapping and duplicate detection
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-xs">
        <div className="max-w-2xl mx-auto">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E5E5E5] hover:border-[#7AF1A7] rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#FAFAFA] hover:bg-[#F0FDF4]/30 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E5E5] text-[#171717] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 group-hover:border-[#7AF1A7] transition-all shadow-xs">
                <UploadCloud className="w-6 h-6 text-[#525252] group-hover:text-[#171717]" />
              </div>
              <p className="text-sm font-semibold text-[#171717] tracking-tight">
                Click to browse or drag and drop spreadsheet
              </p>
              <p className="text-xs text-[#737373] mt-1">Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#15803d] border border-[#B8F7CF] flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#171717]">{fileDetails.name}</p>
                    <p className="text-[11px] text-[#737373] mt-0.5">
                      {fileDetails.size} · Ready to parse
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="p-1.5 text-[#737373] hover:text-[#171717] rounded-lg hover:bg-[#E5E5E5]/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-medium text-[#525252] hover:text-[#171717] rounded-full border border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors"
                >
                  Change File
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleUpload}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#171717] hover:bg-black disabled:bg-[#A3A3A3] rounded-full shadow-xs transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Processing Spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 text-[#7AF1A7]" />
                      <span>Confirm & Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Statistics & Results */}
      {result && (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-xs space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5E5E5]">
            <CheckCircle2 className="w-4 h-4 text-[#15803d]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#171717]">
              Import Processing Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5]">
              <p className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold">Total Rows</p>
              <p className="text-2xl font-bold tracking-tight text-[#171717] mt-1">{result.totalRows}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#B8F7CF]">
              <p className="text-[11px] text-[#15803d] uppercase tracking-wider font-semibold">Ingested</p>
              <p className="text-2xl font-bold tracking-tight text-[#15803d] mt-1">{result.insertedCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5]">
              <p className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold">Duplicates</p>
              <p className="text-2xl font-bold tracking-tight text-[#171717] mt-1">{result.duplicateCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E5E5E5]">
              <p className="text-[11px] text-[#737373] uppercase tracking-wider font-semibold">Failed / Skipped</p>
              <p className="text-2xl font-bold tracking-tight text-[#171717] mt-1">{result.errorCount}</p>
            </div>
          </div>

          {/* Duplicates breakdown */}
          {result.duplicateDetails && result.duplicateDetails.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-[#171717] mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#737373]" />
                Detected Duplicate Candidates ({result.duplicateDetails.length})
              </h4>
              <div className="max-h-40 overflow-y-auto border border-[#E5E5E5] rounded-xl bg-[#FAFAFA] p-3 text-[11px] space-y-1.5 text-[#525252] font-mono">
                {result.duplicateDetails.map((dup, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-[#E5E5E5] last:border-0">
                    <span className="font-medium text-[#171717]">Row {dup.rowNumber}: {dup.email || dup.rollNumber}</span>
                    <span className="text-[#737373] text-[10px]">{dup.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors breakdown */}
          {result.errorDetails && result.errorDetails.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-rose-700 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Failed / Invalid Rows ({result.errorDetails.length})
              </h4>
              <div className="max-h-40 overflow-y-auto border border-rose-200 rounded-xl bg-rose-50/40 p-3 text-[11px] space-y-1.5 text-rose-900 font-mono">
                {result.errorDetails.map((err, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-rose-100 last:border-0">
                    <span className="font-medium">Row {err.rowNumber}: {err.email || 'N/A'}</span>
                    <span className="text-rose-600 text-[10px]">{err.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Column Mapping Reference Card */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[#737373]" />
          <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
            Automated Column Header Mapping Schema
          </h3>
        </div>
        <p className="text-xs text-[#737373] mb-3">
          The system dynamically detects Google Forms exports regardless of column order:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {EXPECTED_MAPPINGS.map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA]">
              <span className="font-semibold text-[#171717] block">{m.target}</span>
              <span className="text-[10px] text-[#737373] block truncate mt-0.5" title={m.forms.join(', ')}>
                Matches: {m.forms.join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
