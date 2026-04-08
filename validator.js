/**
 * 数据导入验证工具核心模块
 * 支持日期、数字、文本等多种数据格式的验证和自动修复
 */

class DataValidator {
    constructor() {
        // 验证规则配置
        this.validationRules = {
            date: {
                patterns: [
                    /^\d{4}-\d{2}-\d{2}$/,           // 2024-01-15
                    /^\d{4}\/\d{2}\/\d{2}$/,          // 2024/01/15
                    /^\d{4}年\d{2}月\d{2}日$/,        // 2024年01月15日
                    /^\d{8}$/,                        // 20240115
                    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/,  // 2024-01-15 14:30:00
                    /^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}$/   // 2024/01/15 14:30:00
                ],
                format: 'YYYY-MM-DD',
                example: '2024-01-15',
                autoFix: true
            },
            datetime: {
                patterns: [
                    /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/,
                    /^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}:\d{2}$/,
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/
                ],
                format: 'YYYY-MM-DD HH:mm:ss',
                example: '2024-01-15 14:30:00',
                autoFix: true
            },
            integer: {
                patterns: [/^-?\d+$/],
                format: '整数',
                example: '123',
                autoFix: true
            },
            decimal: {
                patterns: [/^-?\d+\.?\d*$/],
                format: '小数',
                example: '123.45',
                autoFix: true
            },
            currency: {
                patterns: [/^-?\d+\.?\d{0,2}$/],
                format: '金额（最多2位小数）',
                example: '1234.56',
                autoFix: true
            },
            phone: {
                patterns: [
                    /^1[3-9]\d{9}$/,                  // 手机号
                    /^\d{3,4}-?\d{7,8}$/,             // 固话
                    /^\d{3,4}-?\d{7,8}-?\d{1,4}$/     // 固话转分机
                ],
                format: '手机号或固话',
                example: '13800138000 或 010-12345678',
                autoFix: false
            },
            email: {
                patterns: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/],
                format: '邮箱地址',
                example: 'example@domain.com',
                autoFix: false
            },
            idcard: {
                patterns: [
                    /^\d{15}$/,                       // 15位身份证
                    /^\d{17}[\dXx]$/                  // 18位身份证
                ],
                format: '身份证号码',
                example: '110101199001011234',
                autoFix: false
            },
            code: {
                patterns: [/^[A-Za-z0-9_-]+$/],
                format: '编码（字母、数字、下划线、横线）',
                example: 'PROD_2024_001',
                autoFix: false
            }
        };

        // 字段类型映射
        this.fieldTypeMap = {
            // 日期相关
            '日期': 'date',
            '时间': 'datetime',
            '入职日期': 'date',
            '出生日期': 'date',
            '创建时间': 'datetime',
            '更新时间': 'datetime',
            'date': 'date',
            'datetime': 'datetime',
            
            // 数字相关
            '数量': 'integer',
            '金额': 'currency',
            '价格': 'currency',
            '成本': 'decimal',
            '库存': 'integer',
            'integer': 'integer',
            'decimal': 'decimal',
            'currency': 'currency',
            
            // 联系信息
            '电话': 'phone',
            '手机': 'phone',
            '邮箱': 'email',
            '电子邮件': 'email',
            'phone': 'phone',
            'email': 'email',
            
            // 证件编码
            '身份证': 'idcard',
            '工号': 'code',
            '编码': 'code',
            '编号': 'code',
            '产品编码': 'code',
            'idcard': 'idcard',
            'code': 'code'
        };

        this.errors = [];
        this.warnings = [];
        this.fixedData = [];
    }

    /**
     * 验证单个值
     * @param {string} value - 要验证的值
     * @param {string} fieldType - 字段类型
     * @param {string} fieldName - 字段名称
     * @param {number} rowIndex - 行索引
     * @param {number} colIndex - 列索引
     * @returns {object} 验证结果
     */
    validateValue(value, fieldType, fieldName, rowIndex, colIndex) {
        const result = {
            valid: true,
            value: value,
            originalValue: value,
            fieldName: fieldName,
            fieldType: fieldType,
            rowIndex: rowIndex,
            colIndex: colIndex,
            errors: [],
            warnings: [],
            fixed: false
        };

        // 空值检查
        if (value === null || value === undefined || value.toString().trim() === '') {
            result.errors.push({
                type: 'empty',
                message: `${fieldName} 不能为空`,
                suggestion: '请填写该字段的值'
            });
            result.valid = false;
            return result;
        }

        const stringValue = value.toString().trim();
        const normalizedType = this.fieldTypeMap[fieldType] || fieldType;
        const rules = this.validationRules[normalizedType];

        if (!rules) {
            // 未知类型，作为文本处理
            return result;
        }

        // 检查是否匹配任一模式
        const matched = rules.patterns.some(pattern => pattern.test(stringValue));

        if (!matched) {
            result.valid = false;
            result.errors.push({
                type: 'format',
                message: `${fieldName} 格式不正确`,
                expected: rules.format,
                example: rules.example,
                suggestion: `请使用格式：${rules.format}，例如：${rules.example}`
            });

            // 尝试自动修复
            if (rules.autoFix) {
                const fixed = this.autoFix(stringValue, normalizedType);
                if (fixed !== stringValue) {
                    result.value = fixed;
                    result.fixed = true;
                    result.warnings.push({
                        type: 'auto_fixed',
                        message: `已自动修复为：${fixed}`,
                        original: stringValue
                    });
                }
            }
        }

        return result;
    }

    /**
     * 自动修复数据格式
     * @param {string} value - 原始值
     * @param {string} type - 数据类型
     * @returns {string} 修复后的值
     */
    autoFix(value, type) {
        if (!value) return value;

        switch (type) {
            case 'date':
                return this.fixDate(value);
            case 'datetime':
                return this.fixDateTime(value);
            case 'integer':
                return this.fixInteger(value);
            case 'decimal':
            case 'currency':
                return this.fixDecimal(value);
            case 'phone':
                return this.fixPhone(value);
            default:
                return value;
        }
    }

    fixDate(value) {
        value = value.replace(/\s/g, '');
        
        const patterns = [
            { regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, format: '$1-$2-$3' },
            { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, format: '$1-$2-$3' },
            { regex: /^(\d{4})年(\d{1,2})月(\d{1,2})日$/, format: '$1-$2-$3' },
            { regex: /^(\d{4})(\d{2})(\d{2})$/, format: '$1-$2-$3' },
            { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, format: '$3-$1-$2' },
            { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, format: '$3-$1-$2' }
        ];

        for (const pattern of patterns) {
            const match = value.match(pattern.regex);
            if (match) {
                let result = pattern.format
                    .replace('$1', match[1].padStart(4, '0'))
                    .replace('$2', match[2].padStart(2, '0'))
                    .replace('$3', match[3].padStart(2, '0'));
                
                const date = new Date(result);
                if (!isNaN(date.getTime())) {
                    return result;
                }
            }
        }

        const excelDate = parseFloat(value);
        if (!isNaN(excelDate) && excelDate > 30000 && excelDate < 50000) {
            const date = this.excelDateToJSDate(excelDate);
            if (date) {
                return date.toISOString().split('T')[0];
            }
        }

        return value;
    }

    fixDateTime(value) {
        const datePart = this.fixDate(value.split(/\s+|T/)[0]);
        
        let timePart = '00:00:00';
        const timeMatch = value.match(/(\d{1,2}):(\d{2}):?(\d{2})?/);
        if (timeMatch) {
            timePart = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:${(timeMatch[3] || '00').padStart(2, '0')}`;
        }

        return `${datePart} ${timePart}`;
    }

    fixInteger(value) {
        const cleaned = value.replace(/[^\d-]/g, '');
        const num = parseInt(cleaned);
        return isNaN(num) ? value : num.toString();
    }

    fixDecimal(value) {
        let cleaned = value.replace(/[^\d.-]/g, '');
        
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        
        const num = parseFloat(cleaned);
        return isNaN(num) ? value : num.toString();
    }

    fixPhone(value) {
        const cleaned = value.replace(/\D/g, '');
        
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return cleaned;
        }
        
        if (cleaned.length >= 10) {
            const areaCode = cleaned.substring(0, cleaned.length - 8);
            const mainNumber = cleaned.substring(cleaned.length - 8);
            return `${areaCode}-${mainNumber}`;
        }
        
        return cleaned;
    }

    excelDateToJSDate(serial) {
        const excelEpoch = new Date(1899, 11, 30);
        const days = Math.floor(serial);
        const fraction = serial - days;
        const milliseconds = days * 24 * 60 * 60 * 1000 + fraction * 24 * 60 * 60 * 1000;
        const date = new Date(excelEpoch.getTime() + milliseconds);
        return isNaN(date.getTime()) ? null : date;
    }

    validateDataset(data, schema) {
        const results = {
            valid: true,
            totalRows: data.length,
            errorCount: 0,
            warningCount: 0,
            fixedCount: 0,
            details: [],
            fixedData: []
        };

        data.forEach((row, rowIndex) => {
            const rowResult = {
                rowIndex: rowIndex,
                valid: true,
                fields: []
            };

            const fixedRow = { ...row };

            Object.keys(schema).forEach((fieldName, colIndex) => {
                const fieldType = schema[fieldName];
                const value = row[fieldName];
                
                const validation = this.validateValue(
                    value, 
                    fieldType, 
                    fieldName, 
                    rowIndex + 1, 
                    colIndex
                );

                rowResult.fields.push(validation);

                if (!validation.valid) {
                    rowResult.valid = false;
                    results.valid = false;
                    results.errorCount++;
                }

                if (validation.warnings.length > 0) {
                    results.warningCount++;
                }

                if (validation.fixed) {
                    results.fixedCount++;
                    fixedRow[fieldName] = validation.value;
                }
            });

            results.details.push(rowResult);
            results.fixedData.push(fixedRow);
        });

        return results;
    }

    generateReport(results) {
        let html = `
            <div class="validation-summary">
                <h3>验证摘要</h3>
                <p>总行数：${results.totalRows}</p>
                <p>错误数：${results.errorCount}</p>
                <p>警告数：${results.warningCount}</p>
                <p>自动修复：${results.fixedCount}</p>
            </div>
        `;

        if (!results.valid) {
            html += '<div class="validation-errors"><h3>错误详情</h3>';
            results.details.forEach(row => {
                if (!row.valid) {
                    html += `<div class="error-row">第 ${row.rowIndex} 行：</div>`;
                    row.fields.forEach(field => {
                        if (!field.valid) {
                            field.errors.forEach(error => {
                                html += `
                                    <div class="error-item">
                                        <strong>${field.fieldName}</strong>: ${error.message}
                                        <br>当前值: ${field.originalValue}
                                        <br>建议: ${error.suggestion}
                                    </div>
                                `;
                            });
                        }
                    });
                }
            });
            html += '</div>';
        }

        return html;
    }
}
