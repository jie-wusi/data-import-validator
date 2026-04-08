/**
 * 问题排查指南系统
 * 提供自助式问题排查和解决方案
 */

class TroubleshootingGuide {
    constructor() {
        this.guides = {
            'date': {
                title: '日期格式问题排查',
                icon: '📅',
                steps: [
                    {
                        title: '确认日期格式',
                        content: '检查日期是否符合以下格式之一：\n• 2024-01-15（推荐）\n• 2024/01/15\n• 2024年01月15日\n• 20240115',
                        action: '如果不符合，请修改为上述格式'
                    },
                    {
                        title: '检查年份格式',
                        content: '确保年份为4位数，如2024而不是24',
                        action: '将"24年1月15日"改为"2024年01月15日"'
                    },
                    {
                        title: '检查分隔符',
                        content: '使用短横线(-)或斜杠(/)作为分隔符，避免使用点号(.)',
                        action: '将"2024.01.15"改为"2024-01-15"'
                    },
                    {
                        title: '处理Excel日期序列号',
                        content: '如果日期显示为数字（如45242），这是Excel的日期序列号格式',
                        action: '在Excel中设置单元格格式为"日期"，或使用验证工具的自动修复功能'
                    },
                    {
                        title: '验证日期有效性',
                        content: '确保日期是真实存在的日期（如2月没有30日）',
                        action: '检查并修正为有效日期'
                    }
                ],
                quickFix: '使用验证工具的"自动修复"功能，系统会尝试自动转换日期格式'
            },
            'number': {
                title: '数字格式问题排查',
                icon: '🔢',
                steps: [
                    {
                        title: '移除千分位分隔符',
                        content: '检查是否包含逗号(,)或空格作为千分位分隔符',
                        action: '将"1,234,567"改为"1234567"'
                    },
                    {
                        title: '移除货币符号',
                        content: '检查是否包含¥、$等货币符号',
                        action: '将"¥1000"改为"1000"'
                    },
                    {
                        title: '检查小数位数',
                        content: '金额字段最多支持2位小数',
                        action: '将"123.456"改为"123.46"'
                    },
                    {
                        title: '移除文本内容',
                        content: '确保字段只包含数字和小数点',
                        action: '将"约100"改为"100"'
                    },
                    {
                        title: '检查科学计数法',
                        content: 'Excel可能将大数字显示为科学计数法（如1.23E+05）',
                        action: '在Excel中设置单元格格式为"文本"或"数字"'
                    }
                ],
                quickFix: '使用验证工具的"自动修复"功能，系统会自动移除货币符号和千分位分隔符'
            },
            'encoding': {
                title: '编码问题排查',
                icon: '🔤',
                steps: [
                    {
                        title: '确认文件编码',
                        content: 'CSV文件必须使用UTF-8编码',
                        action: '使用记事本打开文件，选择"另存为"，编码选择"UTF-8"'
                    },
                    {
                        title: '检查数据来源',
                        content: '避免从PDF、网页等复制粘贴文字',
                        action: '手动输入或使用纯文本编辑器编辑'
                    },
                    {
                        title: '处理Excel乱码',
                        content: '如果Excel中显示乱码',
                        action: '使用"数据"→"从文本/CSV"导入，选择UTF-8编码'
                    },
                    {
                        title: '检查特殊字符',
                        content: '某些特殊字符可能导致编码问题',
                        action: '移除或替换特殊字符'
                    },
                    {
                        title: '验证中文字符',
                        content: '确保中文字符显示正常',
                        action: '如果显示为问号或方块，请重新保存为UTF-8编码'
                    }
                ],
                quickFix: '使用验证工具的文件编码检测功能，系统会提示当前文件编码并提供转换建议'
            },
            'missing': {
                title: '必填字段缺失排查',
                icon: '❓',
                steps: [
                    {
                        title: '确认必填字段',
                        content: '查看模板说明，确认哪些字段是必填的',
                        action: '参考"规范文档"→"必填字段"部分'
                    },
                    {
                        title: '检查空值',
                        content: '空单元格、仅包含空格的单元格都被视为空值',
                        action: '确保必填字段有实际内容'
                    },
                    {
                        title: '检查默认值',
                        content: '避免使用"N/A"、"无"、"null"等作为默认值',
                        action: '填写实际内容或联系管理员确认是否可空'
                    },
                    {
                        title: '检查隐藏字符',
                        content: '从其他系统复制的数据可能包含不可见字符',
                        action: '清除单元格内容后重新输入'
                    },
                    {
                        title: '验证数据完整性',
                        content: '确保每行数据的必填字段都已填写',
                        action: '使用验证工具检查，会列出所有缺失的必填字段'
                    }
                ],
                quickFix: '使用验证工具的"必填字段检查"功能，系统会高亮显示所有缺失的必填字段'
            },
            'duplicate': {
                title: '重复数据排查',
                icon: '🔄',
                steps: [
                    {
                        title: '确认主键字段',
                        content: '了解哪些字段组合必须唯一（如工号、订单号等）',
                        action: '查看模板的主键字段说明'
                    },
                    {
                        title: '检查重复值',
                        content: '在Excel中使用"条件格式"→"突出显示重复值"',
                        action: '标记并处理重复数据'
                    },
                    {
                        title: '处理历史数据',
                        content: '如果是更新操作，确认是修改还是新增',
                        action: '更新操作请使用更新模板，新增操作确保编码唯一'
                    },
                    {
                        title: '检查大小写',
                        content: '某些系统区分大小写（如ABC和abc被视为不同）',
                        action: '统一使用大写或小写'
                    },
                    {
                        title: '去除首尾空格',
                        content: '"ABC"和"ABC "被视为不同',
                        action: '使用TRIM函数去除首尾空格'
                    }
                ],
                quickFix: '使用验证工具的"重复检查"功能，系统会列出所有重复的数据行'
            },
            'reference': {
                title: '关联数据错误排查',
                icon: '🔗',
                steps: [
                    {
                        title: '确认关联字段',
                        content: '了解当前数据需要关联哪些基础数据',
                        action: '查看模板的关联字段说明'
                    },
                    {
                        title: '检查关联数据是否存在',
                        content: '确保引用的部门、产品等基础数据已存在',
                        action: '在系统中查询确认关联数据存在'
                    },
                    {
                        title: '核对编码一致性',
                        content: '关联字段的编码必须与基础数据完全一致',
                        action: '复制基础数据中的编码，避免手动输入错误'
                    },
                    {
                        title: '检查数据导入顺序',
                        content: '基础数据必须先于业务数据导入',
                        action: '先导入部门、产品等基础数据，再导入员工、订单等业务数据'
                    },
                    {
                        title: '验证外键约束',
                        content: '确保关联字段值在引用表中存在',
                        action: '使用验证工具的"关联检查"功能'
                    }
                ],
                quickFix: '使用验证工具的"关联数据验证"功能，系统会检查所有外键关联的有效性'
            }
        };

        this.init();
    }

    init() {
        const issueCards = document.querySelectorAll('.issue-card');
        
        issueCards.forEach(card => {
            card.addEventListener('click', () => {
                const issueType = card.getAttribute('data-issue');
                this.showGuide(issueType);
            });
        });
    }

    showGuide(issueType) {
        const guide = this.guides[issueType];
        if (!guide) return;

        const guideContainer = document.getElementById('troubleshootingGuide');
        if (!guideContainer) return;

        let stepsHtml = '';
        guide.steps.forEach((step, index) => {
            stepsHtml += `
                <div class="guide-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-content">
                        <h4>${step.title}</h4>
                        <p>${step.content.replace(/\n/g, '<br>')}</p>
                        <p style="margin-top: 8px; color: #4F46E5;"><strong>解决方法：</strong>${step.action}</p>
                    </div>
                </div>
            `;
        });

        guideContainer.innerHTML = `
            <h3>${guide.icon} ${guide.title}</h3>
            
            <div class="quick-fix-box" style="background: #EEF2FF; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <h4 style="color: #4F46E5; margin-bottom: 8px;">💡 快速修复</h4>
                <p>${guide.quickFix}</p>
            </div>
            
            <div class="guide-steps">
                <h4 style="margin-bottom: 16px;">详细排查步骤</h4>
                ${stepsHtml}
            </div>
            
            <div class="guide-actions" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
                <button class="btn btn-primary" onclick="validator.startValidation()">使用验证工具</button>
                <button class="btn btn-secondary" onclick="docsManager.showDoc('${this.getRelatedDoc(issueType)}')">查看相关文档</button>
            </div>
        `;

        guideContainer.style.display = 'block';
        guideContainer.scrollIntoView({ behavior: 'smooth' });
    }

    getRelatedDoc(issueType) {
        const mapping = {
            'date': 'date-format',
            'number': 'number-format',
            'encoding': 'encoding-guide',
            'missing': 'required-fields',
            'duplicate': 'code-format',
            'reference': 'field-length'
        };
        return mapping[issueType] || 'date-format';
    }
}

let troubleshootingGuide;
document.addEventListener('DOMContentLoaded', () => {
    troubleshootingGuide = new TroubleshootingGuide();
});
