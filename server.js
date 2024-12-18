const express = require('express');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/api/update-excel', (req, res) => {
    const { tenSieuThi, ngayBaoCao, doanhSo } = req.body;

    if (!tenSieuThi || !ngayBaoCao || !doanhSo) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ.' });
    }

    const filePath = './bao_cao_doanh_so.xlsx';

    // Load existing workbook or create a new one
    let workbook;
    if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
    } else {
        workbook = XLSX.utils.book_new();
    }

    // Get or create the sheet
    const sheetName = 'Báo Cáo';
    let worksheet = workbook.Sheets[sheetName];
    const data = worksheet ? XLSX.utils.sheet_to_json(worksheet, { header: 1 }) : [];

    // Add header if empty
    if (data.length === 0) {
        data.push(['Tên Siêu Thị', 'Ngày Báo Cáo', 'Doanh Số']);
    }

    // Add new data
    data.push([tenSieuThi, ngayBaoCao, doanhSo]);

    // Convert back to worksheet and sort by 'Ngày Báo Cáo'
    const sortedData = data.slice(1).sort((a, b) => new Date(a[1]) - new Date(b[1]));
    data.splice(1, data.length - 1, ...sortedData);
    const newWorksheet = XLSX.utils.aoa_to_sheet(data);

    // Save worksheet
    XLSX.utils.book_append_sheet(workbook, newWorksheet, sheetName);
    XLSX.writeFile(workbook, filePath);

    res.json({ message: 'Cập nhật thành công!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
