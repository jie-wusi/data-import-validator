/**
 * 数据导入验证工具 - 主应用程序
 * 集成验证器、文档、指南等模块
 */

class DataImportValidatorApp {
    constructor() {
        this.validator = new DataValidator();
        this.currentFile = null;
        this.currentData = null;
        this.currentSchema = null;
        this.validationResults = null;
        
        this.templates = {
            employee: {
                name: '员工信息',
                fields: {
                    '工号': 'code',
                    '姓名': 'text',
                    '性别': 'text',
                    '入职日期': 'date',
                    '部门': 'text',
                    '职位': 'text',
                    '联系电话': 'phone',
                    '邮箱': 'email',
                    '身份证号': 'idcard',
                    '备注': 'text'
                },
                required: ['工号', '姓名', '入职日期', '部门']
            },
            product: {
                name: '产品信息',
                fields: {
                    '产品编码': 'code',
                    '产品名称': 'text',
                    '规格': 'text',
                    '单位': 'text',
                    '单价': 'currency',
                    '成本': 'decimal',
                    '库存数量': 'integer',
                    '供应商编码': 'code',
                    '备注': 'text'
                },
                required: ['产品编码', '产品名称', '规格', '单价']
            },
            order: {
                name: '订单数据',
                fields: {
                    '订单号': 'code',
                    '客户名称': 'text',
                    '客户编码': 'code',
                    '下单日期': 'date',
                    '订单金额': 'currency',
                    '产品编码': 'code',
                    '产品数量': 'integer',
                    '收货地址': 'text',
                    '联系电话': 'phone',
                    '备注': 'text'
                },
                required: ['订单号', '客户名称', '下单日期', '订单金额']
            },
            inventory: {
                name: '库存数据',
                fields: {
                    '物料编码': 'code',
                    '物料名称': 'text',
                    '仓库编码': 'code',
                    '库存数量': 'integer',
                    '单位': 'text',
                    '批次号': 'code',
                    '入库日期': 'date',
                    '有效期': 'date',
                    '备注': 'text'
                },
                required: ['物料编码', '物料名称', '仓库编码', '库存数量']
            }
        };
        
        this.init();
    }

    init() {
        this.initTabs();
        this.initFileUpload();
        this.initTemplateSelection();
        this.initValidationOptions();
        this.initDocumentation();
        this.initTroubleshooting();
    }

    initTabs() {
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.getAttribute('data-tab');

                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(targetId).classList.add('active');
            });
        });
    }

    initFileUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        if (!uploadArea || !fileInput) return;

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });
    }

    handleFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];

        const extension = file.name.split('.').pop().toLowerCase();

        if (!['xlsx', 'xls', 'csv'].includes(extension)) {
            alert('请上传 Excel (.xlsx, .xls) 或 CSV 文件');
            return;
        }

        this.currentFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (extension === 'csv') {
                    this.parseCSV(e.target.result);
                } else {
                    this.parseExcel(e.target.result);
                }
                this.startValidation();
            } catch (error) {
                console.error('File parsing error:', error);
                alert('文件解析失败：' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    parseExcel(arrayBuffer) {
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        this.currentData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (this.currentData.length === 0) {
            throw new Error('文件中没有数据');
        }

        this.detectSchema();
    }

    parseCSV(text) {
        const result = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            encoding: 'UTF-8'
        });

        if (result.errors.length > 0) {
            console.warn('CSV parsing warnings:', result.errors);
        }

        this.currentData = result.data;
        
        if (this.currentData.length === 0) {
            throw new Error('文件中没有数据');
        }

        this.detectSchema();
    }

    detectSchema() {
        if (this.currentData.length === 0) return;

        const headers = Object.keys(this.currentData[0]);
        this.currentSchema = {};

        headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            
            if (lowerHeader.includes('日期') || lowerHeader.includes('时间') || lowerHeader === 'date' || lowerHeader === 'datetime') {
                this.currentSchema[header] = 'date';
            } else if (lowerHeader.includes('金额') || lowerHeader.includes('价格') || lowerHeader.includes('成本')) {
                this.currentSchema[header] = 'currency';
            } else if (lowerHeader.includes('数量') || lowerHeader.includes('库存')) {
                this.currentSchema[header] = 'integer';
            } else if (lowerHeader.includes('电话') || lowerHeader.includes('手机')) {
                this.currentSchema[header] = 'phone';
            } else if (lowerHeader.includes('邮箱') || lowerHeader.includes('email')) {
                this.currentSchema[header] = 'email';
            } else if (lowerHeader.includes('身份证')) {
                this.currentSchema[header] = 'idcard';
            } else if (lowerHeader.includes('编码') || lowerHeader.includes('编号') || lowerHeader.includes('工号')) {
                this.currentSchema[header] = 'code';
            } else {
                this.currentSchema[header] = 'text';
            }
        });

        console.log('Detected schema:', this.currentSchema);
    }

    initValidationOptions() {
        const strictMode = document.getElementById('strictMode');
        const autoFix = document.getElementById('autoFix');
        const showExamples = document.getElementById('showExamples');
        const downloadReport = document.getElementById('downloadReport');
        const downloadFixed = document.getElementById('downloadFixed');

        if (downloadReport) {
            downloadReport.addEventListener('click', () => this.downloadReport());
        }

        if (downloadFixed) {
            downloadFixed.addEventListener('click', () => this.downloadFixedFile());
        }
    }

    startValidation() {
        if (!this.currentData || !this.currentSchema) {
            alert('请先上传文件');
            return;
        }

        const autoFixEnabled = document.getElementById('autoFix')?.checked ?? true;

        this.validationResults = this.validator.validateDataset(
            this.currentData,
            this.currentSchema
        );

        this.displayResults();
    }

    displayResults() {
        const resultContainer = document.getElementById('validationResult');
        const errorList = document.getElementById('errorList');
        const errorCount = document.getElementById('errorCount');
        const warningCount = document.getElementById('warningCount');
        const successCount = document.getElementById('successCount');

        if (!resultContainer) return;

        resultContainer.style.display = 'block';

        let errorItems = [];
        let warningItems = [];
        let successItems = [];

        this.validationResults.details.forEach(row => {
            row.fields.forEach(field => {
                if (!field.valid && field.errors.length > 0) {
                    field.errors.forEach(error => {
                        errorItems.push({
                            type: 'error',
                            row: field.rowIndex,
                            col: field.colIndex,
                            fieldName: field.fieldName,
                            originalValue: field.originalValue,
                            ...error
                        });
                    });
                }

                if (field.warnings.length > 0) {
                    field.warnings.forEach(warning => {
                        warningItems.push({
                            type: 'warning',
                            row: field.rowIndex,
                            col: field.colIndex,
                            fieldName: field.fieldName,
                            originalValue: field.originalValue,
                            ...warning
                        });
                    });
                }
            });
        });

        const totalFields = this.validationResults.totalRows * Object.keys(this.currentSchema).length;
        const validFields = totalFields - errorItems.length;

        if (errorCount) errorCount.textContent = errorItems.length;
        if (warningCount) warningCount.textContent = warningItems.length;
        if (successCount) successCount.textContent = Math.max(0, validFields);

        let html = '';

        errorItems.forEach(item => {
            html += `
                <div class="error-item error">
                    <div class="error-icon">❌</div>
                    <div class="error-content">
                        <div class="error-title">${item.message}</div>
                        <div class="error-location">第 ${item.row} 行，第 ${item.col + 1} 列 (${item.fieldName})</div>
                        <div class="error-message">当前值: <code>${this.escapeHtml(String(item.originalValue || '(空)'))}</code></div>
                        <div class="error-suggestion">💡 ${item.suggestion || '请修正为正确的格式'}</div>
                    </div>
                </div>
            `;
        });

        warningItems.forEach(item => {
            html += `
                <div class="error-item warning">
                    <div class="error-icon">⚠️</div>
                    <div class="error-content">
                        <div class="error-title">${item.message}</div>
                        <div class="error-location">第 ${item.row} 行，第 ${item.col + 1} 列 (${item.fieldName})</div>
                        <div class="error-message">原始值: <code>${this.escapeHtml(String(item.original || ''))}</code></div>
                    </div>
                </div>
            `;
        });

        if (errorItems.length === 0 && warningItems.length === 0) {
            html += `
                <div class="error-item success">
                    <div class="error-icon">✅</div>
                    <div class="error-content">
                        <div class="error-title">所有数据验证通过！</div>
                        <div class="error-message">共验证 ${this.validationResults.totalRows} 行数据，未发现格式错误。</div>
                    </div>
                </div>
            `;
        }

        if (errorList) errorList.innerHTML = html;

        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    downloadReport() {
        if (!this.validationResults) {
            alert('请先进行数据验证');
            return;
        }

        let report = '数据导入验证报告\n';
        report += '='.repeat(50) + '\n';
        report += `生成时间: ${new Date().toLocaleString()}\n`;
        report += `文件名称: ${this.currentFile?.name || '未知'}\n\n`;
        
        report += '验证摘要:\n';
        report += '-'.repeat(30) + '\n';
        report += `总行数: ${this.validationResults.totalRows}\n`;
        report += `错误数: ${this.validationResults.errorCount}\n`;
        report += `警告数: ${this.validationResults.warningCount}\n`;
        report += `自动修复数: ${this.validationResults.fixedCount}\n\n`;

        if (this.validationResults.errorCount > 0) {
            report += '错误详情:\n';
            report += '-'.repeat(30) + '\n';
            
            this.validationResults.details.forEach(row => {
                row.fields.forEach(field => {
                    if (!field.valid && field.errors.length > 0) {
                        field.errors.forEach(error => {
                            report += `[第${field.rowIndex}行] ${field.fieldName}\n`;
                            report += `  错误: ${error.message}\n`;
                            report += `  当前值: ${field.originalValue || '(空)'}\n`;
                            report += `  建议: ${error.suggestion || '请修正'}\n\n`;
                        });
                    }
                });
            });
        }

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `验证报告_${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadFixedFile() {
        if (!this.validationResults || !this.validationResults.fixedData) {
            alert('没有可下载的修复数据');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(this.validationResults.fixedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '修复后数据');
        
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `修复后数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    }

    initTemplateSelection() {
        const templateCards = document.querySelectorAll('.template-card');
        const templatePreview = document.getElementById('templatePreview');
        const fieldList = document.getElementById('fieldList');
        const downloadTemplate = document.getElementById('downloadTemplate');

        if (!templateCards.length) return;

        templateCards.forEach(card => {
            card.addEventListener('click', () => {
                templateCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const templateType = card.getAttribute('data-template');
                const template = this.templates[templateType];

                if (template && templatePreview && fieldList) {
                    document.getElementById('templateTitle').textContent = template.name + ' 模板字段说明';
                    
                    let html = '';
                    Object.keys(template.fields).forEach(fieldName => {
                        const fieldType = template.fields[fieldName];
                        const isRequired = template.required.includes(fieldName);
                        
                        html += `
                            <div class="field-item">
                                <span class="field-name">${fieldName}</span>
                                <span class="field-type">${fieldType}</span>
                                ${isRequired ? '<span class="field-required">必填</span>' : '<span class="field-optional">选填</span>'}
                                <span class="field-desc">${this.getFieldDescription(fieldName)}</span>
                                <span class="field-example">${this.getFieldExample(fieldType)}</span>
                            </div>
                        `;
                    });

                    fieldList.innerHTML = html;
                    templatePreview.style.display = 'block';

                    this.selectedTemplate = templateType;
                }
            });
        });

        if (downloadTemplate) {
            downloadTemplate.addEventListener('click', () => this.downloadTemplate());
        }
    }

    getFieldDescription(fieldName) {
        const descriptions = {
            '工号': '系统唯一标识，建议使用字母+数字组合',
            '姓名': '员工真实姓名',
            '性别': '男/女',
            '入职日期': '格式: 2024-01-15',
            '部门': '所属部门名称',
            '职位': '担任的职位',
            '联系电话': '手机号或固定电话',
            '邮箱': '常用电子邮箱',
            '身份证号': '18位身份证号码',
            '产品编码': '产品唯一标识',
            '产品名称': '产品全称',
            '规格': '产品规格型号',
            '单位': '计量单位',
            '单价': '销售价格',
            '成本': '进货成本价',
            '库存数量': '当前库存数量',
            '供应商编码': '供应商唯一标识',
            '订单号': '订单唯一编号',
            '客户名称': '客户全称',
            '客户编码': '客户唯一标识',
            '下单日期': '订单日期',
            '订单金额': '订单总金额',
            '产品数量': '订购数量',
            '收货地址': '详细收货地址',
            '物料编码': '物料唯一编码',
            '物料名称': '物料名称',
            '仓库编码': '仓库唯一编码',
            '批次号': '批次编号',
            '入库日期': '入库时间',
            '有效期': '到期日期'
        };
        return descriptions[fieldName] || '';
    }

    getFieldExample(fieldType) {
        const examples = {
            'date': '2024-01-15',
            'datetime': '2024-01-15 14:30:00',
            'integer': '100',
            'decimal': '99.99',
            'currency': '1234.56',
            'phone': '13800138000',
            'email': 'example@company.com',
            'idcard': '110101199001011234',
            'code': 'EMP_2024_001',
            'text': '文本内容'
        };
        return examples[fieldType] || '';
    }

    downloadTemplate() {
        if (!this.selectedTemplate) {
            alert('请先选择模板类型');
            return;
        }

        const template = this.templates[this.selectedTemplate];
        if (!template) return;

        const headers = Object.keys(template.fields);
        const data = [headers.join(',')];
        
        const exampleRow = headers.map(h => this.getFieldExample(template.fields[h]));
        data.push(exampleRow.join(','));

        const csvContent = '\uFEFF' + data.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name}_导入模板.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    initDocumentation() {
        setTimeout(() => {
            if (typeof docsManager !== 'undefined') {
                docsManager.init();
            }
        }, 100);
    }

    initTroubleshooting() {
        setTimeout(() => {
            if (typeof troubleshootingGuide !== 'undefined') {
                troubleshootingGuide.init();
            }
        }, 100);
    }
}

let validator;
document.addEventListener('DOMContentLoaded', () => {
    validator = new DataImportValidatorApp();
});
