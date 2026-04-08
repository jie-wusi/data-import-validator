/**
 * 规范文档系统
 * 提供全面的数据录入规范和文档内容
 */

class DocumentationManager {
    constructor() {
        this.docs = {
            'date-format': {
                title: '日期格式规范',
                content: `
                    <h2>日期格式规范</h2>
                    
                    <h3>标准日期格式</h3>
                    <p>系统接受的日期格式有以下几种：</p>
                    
                    <div class="example-box good">
                        <h4>✅ 正确格式</h4>
                        <ul>
                            <li><strong>标准格式：</strong>2024-01-15</li>
                            <li><strong>斜杠格式：</strong>2024/01/15</li>
                            <li><strong>中文格式：</strong>2024年01月15日</li>
                            <li><strong>紧凑格式：</strong>20240115</li>
                        </ul>
                    </div>
                    
                    <div class="example-box bad">
                        <h4>❌ 错误格式</h4>
                        <ul>
                            <li><strong>纯数字：</strong>2024015（缺少前导零）</li>
                            <li><strong>中文年月日：</strong>24年1月15日（年份应完整）</li>
                            <li><strong>美式格式：</strong>01/15/2024（月/日/年）</li>
                            <li><strong>点分隔：</strong>2024.01.15</li>
                        </ul>
                    </div>
                    
                    <h3>常见问题</h3>
                    <ul>
                        <li>日期必须使用4位数年份</li>
                        <li>月份和日期必须使用2位数字（不足时补零）</li>
                        <li>避免使用点号(.)作为分隔符</li>
                        <li>导入时请勿使用Excel默认的日期格式（会导致序列号问题）</li>
                    </ul>
                    
                    <h3>最佳实践</h3>
                    <ol>
                        <li>建议统一使用<strong>2024-01-15</strong>格式</li>
                        <li>在Excel中输入时，先输入英文单引号再输入日期</li>
                        <li>避免复制粘贴从其他系统生成的日期</li>
                        <li>批量导入前使用验证工具检查</li>
                    </ol>
                `
            },
            'number-format': {
                title: '数字格式规范',
                content: `
                    <h2>数字格式规范</h2>
                    
                    <h3>整数格式</h3>
                    <p>整数类型字段要求：</p>
                    <ul>
                        <li>只包含数字和可选的负号</li>
                        <li>不能包含小数点</li>
                        <li>不能包含逗号分隔符</li>
                    </ul>
                    
                    <div class="example-box good">
                        <h4>✅ 正确格式</h4>
                        <ul>
                            <li><code>123</code></li>
                            <li><code>-456</code></li>
                            <li><code>0</code></li>
                        </ul>
                    </div>
                    
                    <div class="example-box bad">
                        <h4>❌ 错误格式</h4>
                        <ul>
                            <li><code>1,234</code>（包含逗号）</li>
                            <li><code>123.00</code>（包含小数点）</li>
                            <li><code>$100</code>（包含货币符号）</li>
                        </ul>
                    </div>
                    
                    <h3>金额格式</h3>
                    <p>金额类型字段要求：</p>
                    <ul>
                        <li>最多2位小数</li>
                        <li>不能包含货币符号</li>
                        <li>不能包含千位分隔符</li>
                    </ul>
                    
                    <div class="example-box good">
                        <h4>✅ 正确格式</h4>
                        <ul>
                            <li><code>1234.56</code></li>
                            <li><code>-99.99</code></li>
                            <li><code>100</code></li>
                        </ul>
                    </div>
                    
                    <h3>常见错误</h3>
                    <ul>
                        <li><strong>千分位逗号：</strong>1,234,567 → 应改为 1234567</li>
                        <li><strong>货币符号：</strong>$100 或 ¥200 → 应改为 100 或 200</li>
                        <li><strong>多余小数位：</strong>123.456 → 应改为 123.46</li>
                        <li><strong>空格：</strong>1 234 → 应改为 1234</li>
                    </ul>
                `
            },
            'text-format': {
                title: '文本格式规范',
                content: `
                    <h2>文本格式规范</h2>
                    
                    <h3>通用文本要求</h3>
                    <ul>
                        <li>避免首尾空格</li>
                        <li>避免多余的换行符</li>
                        <li>中英文之间可保留空格</li>
                    </ul>
                    
                    <h3>特殊字符处理</h3>
                    <p>以下字符需要特别注意：</p>
                    
                    <table>
                        <tr>
                            <th>字符</th>
                            <th>说明</th>
                            <th>建议</th>
                        </tr>
                        <tr>
                            <td><code>&amp;</code></td>
                            <td>英文&amp;符号</td>
                            <td>可用中文"和"替代</td>
                        </tr>
                        <tr>
                            <td><code>&lt; &gt;</code></td>
                            <td>尖括号</td>
                            <td>可能引起XML/HTML解析问题</td>
                        </tr>
                        <tr>
                            <td><code>" ' </code></td>
                            <td>引号</td>
                            <td>注意中英文引号区别</td>
                        </tr>
                        <tr>
                            <td><code>\\ |</code></td>
                            <td>反斜杠和竖线</td>
                            <td>可能引起路径解析问题</td>
                        </tr>
                    </table>
                    
                    <h3>编码问题</h3>
                    <p>为避免中文乱码，请确保：</p>
                    <ul>
                        <li>文件编码为UTF-8</li>
                        <li>不要从PDF等格式复制文字</li>
                        <li>使用纯文本编辑器编辑</li>
                        <li>Excel中避免使用全角字符</li>
                    </ul>
                `
            },
            'code-format': {
                title: '编码格式规范',
                content: `
                    <h2>编码格式规范</h2>
                    
                    <h3>编码命名规则</h3>
                    <p>系统中的各类编码（工号、产品编码、订单号等）应遵循以下规则：</p>
                    
                    <ul>
                        <li>只能包含：字母、数字、下划线(_)、短横线(-)</li>
                        <li>不能包含空格</li>
                        <li>不能包含特殊符号</li>
                        <li>长度根据类型而定</li>
                    </ul>
                    
                    <div class="example-box good">
                        <h4>✅ 正确格式</h4>
                        <ul>
                            <li><code>EMP_2024_001</code></li>
                            <li><code>PROD-A001</code></li>
                            <li><code>ORDER-20240115-001</code></li>
                            <li><code>A1001</code></li>
                        </ul>
                    </div>
                    
                    <div class="example-box bad">
                        <h4>❌ 错误格式</h4>
                        <ul>
                            <li><code>EMP 001</code>（包含空格）</li>
                            <li><code>PROD/A001</code>（包含斜杠）</li>
                            <li><code>ORDER#001</code>（包含井号）</li>
                            <li><code>产品001</