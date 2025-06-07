// spirit.js
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const previewContainer = document.getElementById('previewContainer');
    const fileTypeIcon = document.getElementById('fileTypeIcon');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileExtension = document.getElementById('fileExtension');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    const progressSpeed = document.getElementById('progressSpeed');
    const resultContainer = document.getElementById('resultContainer');
    const fileUrl = document.getElementById('fileUrl');
    const copyBtn = document.getElementById('copyBtn');
    const successMessage = document.getElementById('successMessage');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const logsContainer = document.getElementById('logsContainer');
    const exportLogsBtn = document.getElementById('exportLogsBtn');
    const importLogsBtn = document.getElementById('importLogsBtn');
    const clearLogsBtn = document.getElementById('clearLogsBtn');
    const chunkUploadOption = document.getElementById('chunkUpload');
    const chunkUrlInput = document.getElementById('chunkUrlInput');
    const downloadChunkBtn = document.getElementById('downloadChunkBtn');
    const downloadMessage = document.getElementById('downloadMessage');
    const maxSizeSpan = document.getElementById('maxSize');
    const helpIcon = document.getElementById('helpIcon');
    const modal = document.getElementById('helpModal');
    const closeBtn = document.querySelector('.close');
    
    let selectedFile = null;
    let isLargeFile = false;
    let uploadStartTime = 0;
    let simulatedProgress = 0;
    let simulatedTimer = null;
    let lastLoaded = 0;
    let lastTime = 0;
    let logs = [];
    
    // 初始化日志
    initLogs();
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
        
        document.addEventListener('click', (event) => {
            if (!navLinks.contains(event.target) && !hamburger.contains(event.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
    
helpIcon.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    // 点击关闭按钮隐藏模态框
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部区域关闭
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    browseBtn.addEventListener('click', () => {
        fileInput.value = '';
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
    
    uploadBtn.addEventListener('click', uploadFile);
    
    copyBtn.addEventListener('click', () => {
        fileUrl.select();
        document.execCommand('copy');
        
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 2000);
    });
    
    // 日志按钮事件
    exportLogsBtn.addEventListener('click', exportLogs);
    importLogsBtn.addEventListener('click', importLogs);
    clearLogsBtn.addEventListener('click', clearLogs);
    
    // 下载按钮事件
    downloadChunkBtn.addEventListener('click', downloadAndMerge);
    
    // 分块上传选项变化时更新最大文件大小提示
    chunkUploadOption.addEventListener('change', function() {
        maxSizeSpan.textContent = this.checked ? '200MB' : '30MB';
    });
    
    function handleFileSelect(e) {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    }
    
    function handleFile(file) {
        selectedFile = null;
        previewContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        progressContainer.style.display = 'none';
        uploadBtn.disabled = true;
        
        // 根据文件大小设置分块上传选项
        if (file.size < 2 * 1024 * 1024) {
            // 小于2MB：禁用分块上传
            chunkUploadOption.checked = false;
            chunkUploadOption.disabled = true;
        } else if (file.size > 30 * 1024 * 1024) {
            // 大于30MB：强制分块上传
            chunkUploadOption.checked = true;
            chunkUploadOption.disabled = true;
        } else {
            // 2MB~30MB：允许选择
            chunkUploadOption.disabled = false;
        }
        
        // 根据是否选择分块上传确定文件大小限制
        const maxSize = chunkUploadOption.checked ? 200 * 1024 * 1024 : 30 * 1024 * 1024;
        
        if (file.size > maxSize) {
            alert(`文件大小不能超过${formatFileSize(maxSize)}`);
            return;
        }
        
        selectedFile = file;
        isLargeFile = file.size > 5 * 1024 * 1024;
        
        // 设置文件信息
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        
        // 获取文件扩展名
        const ext = file.name.split('.').pop().toLowerCase();
        fileExtension.textContent = ext.toUpperCase();
        
        // 根据文件类型设置图标
        setFileIcon(ext);
        
        previewContainer.style.display = 'flex';
        uploadBtn.disabled = false;
    }
    
    function setFileIcon(ext) {
        // 移除所有图标类
        fileTypeIcon.className = 'fas file-icon';
        
        // 根据文件扩展名设置图标
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        const docExts = ['doc', 'docx', 'txt', 'pdf', 'rtf'];
        const audioExts = ['mp3', 'wav', 'ogg', 'flac'];
        const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'wmv'];
        const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
        
        if (imageExts.includes(ext)) {
            fileTypeIcon.classList.add('fa-image', 'file-type-image');
        } else if (docExts.includes(ext)) {
            fileTypeIcon.classList.add('fa-file-alt', 'file-type-document');
        } else if (audioExts.includes(ext)) {
            fileTypeIcon.classList.add('fa-file-audio', 'file-type-audio');
        } else if (videoExts.includes(ext)) {
            fileTypeIcon.classList.add('fa-file-video', 'file-type-video');
        } else if (archiveExts.includes(ext)) {
            fileTypeIcon.classList.add('fa-file-archive', 'file-type-archive');
        } else {
            fileTypeIcon.classList.add('fa-file', 'file-type-other');
        }
    }
    
    function uploadFile() {
        if (!selectedFile) return;
        
        uploadBtn.disabled = true;
        
        progressContainer.style.display = 'flex';
        progressBar.style.width = '0%';
        progressPercent.textContent = '0';
        progressSpeed.textContent = '0 MB/s';
        
        // 记录开始时间
        uploadStartTime = Date.now();
        lastLoaded = 0;
        lastTime = uploadStartTime;
        
        // 检查是否分块上传
        const useChunkUpload = chunkUploadOption.checked;
        
        if (useChunkUpload) {
            uploadChunkedFile();
        } else {
            uploadSingleFile();
        }
    }
    
    function uploadSingleFile() {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const xhr = new XMLHttpRequest();
        
        // 清除之前的模拟定时器
        if (simulatedTimer) {
            clearInterval(simulatedTimer);
            simulatedTimer = null;
        }
        
        // 对于大文件，启动模拟进度条
        if (isLargeFile) {
            simulatedProgress = 0;
            simulatedTimer = setInterval(() => {
                if (simulatedProgress < 95) {
                    simulatedProgress += 1;
                    updateProgressBar(simulatedProgress);
                }
            }, 100);
        }
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                const currentTime = Date.now();
                const timeDiff = (currentTime - lastTime) / 1000; // 秒
                
                if (timeDiff > 0) {
                    const loadedDiff = e.loaded - lastLoaded;
                    const speed = loadedDiff / timeDiff; // 字节/秒
                    const speedMB = (speed / (1024 * 1024)).toFixed(2);
                    
                    progressSpeed.textContent = `${speedMB} MB/s`;
                    
                    lastLoaded = e.loaded;
                    lastTime = currentTime;
                }
                
                // 对于小文件，直接使用真实进度
                if (!isLargeFile) {
                    updateProgressBar(percent);
                }
            }
        });
        
        xhr.addEventListener('load', () => {
            // 清除模拟定时器
            if (simulatedTimer) {
                clearInterval(simulatedTimer);
            }
            
            // 快速完成最后5%的进度
            if (isLargeFile) {
                let progress = 95;
                const finishProgress = () => {
                    if (progress < 100) {
                        progress += 1;
                        updateProgressBar(progress);
                        setTimeout(finishProgress, 30);
                    }
                };
                finishProgress();
            } else {
                updateProgressBar(100);
            }
            
            setTimeout(() => {
                let logEntry = {
                    time: new Date().toISOString(),
                    fileName: selectedFile.name,
                    fileSize: selectedFile.size,
                    status: xhr.status === 200 ? 'success' : 'error'
                };
                
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.url) {
                            fileUrl.value = response.url;
                            resultContainer.style.display = 'flex';
                            
                            // 自动滚动到结果区域
                            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            
                            // 添加成功日志
                            logEntry.url = response.url;
                            logEntry.apiResponse = xhr.responseText;
                            addLog(logEntry);
                        } else {
                            throw new Error('无效的响应');
                        }
                    } catch (e) {
                        alert('上传失败: 服务器返回无效响应');
                        logEntry.error = '无效的响应';
                        logEntry.apiResponse = xhr.responseText;
                        addLog(logEntry);
                    }
                } else {
                    alert(`上传失败: ${xhr.statusText}`);
                    logEntry.error = xhr.statusText;
                    logEntry.apiResponse = xhr.responseText;
                    addLog(logEntry);
                }
                
                progressContainer.style.display = 'none';
                uploadBtn.disabled = false;
            }, isLargeFile ? 600 : 0);
        });
        
        xhr.addEventListener('error', () => {
            // 清除模拟定时器
            if (simulatedTimer) {
                clearInterval(simulatedTimer);
            }
            
            alert('上传失败: 网络错误');
            
            // 添加错误日志
            addLog({
                time: new Date().toISOString(),
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                status: 'error',
                error: '网络错误',
                apiResponse: ''
            });
            
            progressContainer.style.display = 'none';
            uploadBtn.disabled = false;
        });
        
        xhr.open('POST', 'https://api.pgaot.com/user/up_cat_file');
        xhr.send(formData);
    }
    
    function uploadChunkedFile() {
        const CHUNK_SIZE = Math.ceil(selectedFile.size / 5); // 分成5块
        const totalChunks = 5;
        let currentChunk = 0;
        let chunkUrls = []; // 存储每个分块上传后的URL
        
        // 更新进度条函数（分块上传的总进度）
        function updateChunkProgress(percent) {
            updateProgressBar(percent);
        }
        
        // 模拟进度（每个分块上传前先模拟到该分块的基础进度）
        simulatedProgress = 0;
        simulatedTimer = setInterval(() => {
            if (simulatedProgress < currentChunk * 20) {
                simulatedProgress += 1;
                updateChunkProgress(simulatedProgress);
            } else {
                clearInterval(simulatedTimer);
                simulatedTimer = null;
            }
        }, 50);
        
        // 上传一个分块
        function uploadNextChunk() {
            if (currentChunk >= totalChunks) {
                // 所有分块上传完成
                clearInterval(simulatedTimer);
                updateChunkProgress(100);
                
                // 生成分块链接的base64编码字符串
                const chunkUrlsStr = chunkUrls.join(',');
                const base64ChunkUrls = btoa(chunkUrlsStr);
                
                // 生成最终链接：base64加密文本.文件名.后缀
                const fileNameParts = selectedFile.name.split('.');
                const fileExtension = fileNameParts.pop();
                const fileNameWithoutExt = fileNameParts.join('.');
                const finalUrl = `${base64ChunkUrls}.${fileNameWithoutExt}.${fileExtension}`;
                
                // 显示结果
                fileUrl.value = finalUrl;
                resultContainer.style.display = 'flex';
                
                // 填充到独立下载区域的输入框
                chunkUrlInput.value = finalUrl;
                downloadMessage.style.display = 'block';
                setTimeout(() => {
                    downloadMessage.style.display = 'none';
                }, 3000);
                
                // 添加日志
                addLog({
                    time: new Date().toISOString(),
                    fileName: selectedFile.name,
                    fileSize: selectedFile.size,
                    status: 'success',
                    url: finalUrl,
                    apiResponse: JSON.stringify({ chunkUrls: chunkUrls })
                });
                
                progressContainer.style.display = 'none';
                uploadBtn.disabled = false;
                return;
            }
            
            const start = currentChunk * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, selectedFile.size);
            const chunk = selectedFile.slice(start, end);
            
            const formData = new FormData();
            formData.append('file', chunk, `${selectedFile.name}.part${currentChunk+1}`);
            formData.append('chunkIndex', currentChunk);
            formData.append('totalChunks', totalChunks);
            formData.append('originalFilename', selectedFile.name);
            
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    // 当前分块的进度
                    const chunkPercent = Math.round((e.loaded / e.total) * 100);
                    // 总进度 = 已完成的分块 * 20 + 当前分块进度的20%
                    const totalPercent = currentChunk * 20 + chunkPercent * 0.2;
                    updateChunkProgress(totalPercent);
                    
                    // 计算速度
                    const currentTime = Date.now();
                    const timeDiff = (currentTime - lastTime) / 1000; // 秒
                    if (timeDiff > 0) {
                        const loadedDiff = e.loaded - lastLoaded;
                        const speed = loadedDiff / timeDiff; // 字节/秒
                        const speedMB = (speed / (1024 * 1024)).toFixed(2);
                        progressSpeed.textContent = `${speedMB} MB/s`;
                        lastLoaded = e.loaded;
                        lastTime = currentTime;
                    }
                }
            });
            
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.url) {
                            chunkUrls.push(response.url);
                            currentChunk++;
                            // 上传下一个分块
                            uploadNextChunk();
                        } else {
                            throw new Error('无效的响应');
                        }
                    } catch (e) {
                        handleUploadError(`分块${currentChunk+1}上传失败: 服务器返回无效响应`);
                    }
                } else {
                    handleUploadError(`分块${currentChunk+1}上传失败: ${xhr.statusText}`);
                }
            });
            
            xhr.addEventListener('error', () => {
                handleUploadError(`分块${currentChunk+1}上传失败: 网络错误`);
            });
            
            xhr.open('POST', 'https://api.pgaot.com/user/up_cat_file');
            xhr.send(formData);
        }
        
        function handleUploadError(message) {
            clearInterval(simulatedTimer);
            alert(message);
            // 添加错误日志
            addLog({
                time: new Date().toISOString(),
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                status: 'error',
                error: message,
                apiResponse: xhr ? xhr.responseText : ''
            });
            progressContainer.style.display = 'none';
            uploadBtn.disabled = false;
        }
        
        // 开始上传第一个分块
        uploadNextChunk();
    }
    
    function updateProgressBar(percent) {
        progressBar.style.width = `${percent}%`;
        progressPercent.textContent = percent;
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 日志功能
    function initLogs() {
        // 尝试从localStorage加载日志
        const savedLogs = localStorage.getItem('uploadLogs');
        if (savedLogs) {
            logs = JSON.parse(savedLogs);
        } else {
            // 添加一些示例日志
            logs = [
                {
                    time: "2023-08-15T14:30:22.000Z",
                    fileName: "example.png",
                    fileSize: 2621440,
                    status: "success",
                    url: "https://example.com/files/example.png",
                    apiResponse: JSON.stringify({status: 200, url: "https://example.com/files/example.png"})
                },
                {
                    time: "2023-08-15T14:25:45.000Z",
                    fileName: "largefile.zip",
                    fileSize: 33554432,
                    status: "error",
                    error: "文件大小超过限制",
                    apiResponse: JSON.stringify({status: 400, error: "文件大小超过30MB限制"})
                }
            ];
        }
        renderLogs();
    }
    
    function addLog(log) {
        logs.unshift(log);
        if (logs.length > 100) {
            logs.pop(); // 限制日志数量
        }
        saveLogs();
        renderLogs();
    }
    
    function renderLogs() {
        logsContainer.innerHTML = '';
        
        logs.forEach(log => {
            const logElement = document.createElement('div');
            logElement.className = `log-entry ${log.status}`;
            
            const localTime = new Date(log.time).toLocaleString('zh-CN');
            const fileSizeFormatted = formatFileSize(log.fileSize);
            
            let content = `<div class="log-time">[${localTime}]</div>`;
            
            if (log.status === 'success') {
                content += `<div>上传成功: ${log.fileName} (${fileSizeFormatted}) | URL: ${log.url || '无'}</div>`;
            } else {
                content += `<div>上传失败: ${log.fileName} (${fileSizeFormatted}) | 错误: ${log.error || '未知错误'}</div>`;
            }
            
            content += `<div>API响应: ${log.apiResponse || '无响应数据'}</div>`;
            
            logElement.innerHTML = content;
            logsContainer.appendChild(logElement);
        });
    }
    
    function saveLogs() {
        localStorage.setItem('uploadLogs', JSON.stringify(logs));
    }
    
    function exportLogs() {
        const logText = logs.map(log => {
            const localTime = new Date(log.time).toLocaleString('zh-CN');
            let line = `[${localTime}] ${log.fileName} (${formatFileSize(log.fileSize)}) - `;
            
            if (log.status === 'success') {
                line += `成功: ${log.url}`;
            } else {
                line += `失败: ${log.error || '未知错误'}`;
            }
            
            line += `\nAPI响应: ${log.apiResponse || '无响应数据'}`;
            return line;
        }).join('\n\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // 生成文件名: modernlink_logs_年月日时分秒
        const now = new Date();
        const dateStr = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
            String(now.getHours()).padStart(2, '0'),
            String(now.getMinutes()).padStart(2, '0'),
            String(now.getSeconds()).padStart(2, '0')
        ].join('');
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `modernlink_logs_${dateStr}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function importLogs() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const content = event.target.result;
                    const lines = content.split('\n');
                    const newLogs = [];
                    
                    // 简单解析日志文本
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].trim() === '') continue;
                        
                        const timeMatch = lines[i].match(/\[(.*?)\]/);
                        if (!timeMatch) continue;
                        
                        const time = new Date(timeMatch[1]).toISOString();
                        const fileNameMatch = lines[i].match(/\](.*?)\(/);
                        const fileSizeMatch = lines[i].match(/\((.*?)\)/);
                        const statusMatch = lines[i].match(/成功|失败/);
                        const apiResponseLine = lines[i+1] && lines[i+1].includes('API响应:') ? lines[i+1] : '';
                        
                        if (!timeMatch || !fileNameMatch || !fileSizeMatch || !statusMatch) continue;
                        
                        const fileName = fileNameMatch[0].slice(2, -1).trim();
                        const fileSizeStr = fileSizeMatch[1].trim();
                        const status = statusMatch[0] === '成功' ? 'success' : 'error';
                        const apiResponse = apiResponseLine ? apiResponseLine.split('API响应:')[1].trim() : '';
                        
                        // 转换文件大小
                        let fileSize = 0;
                        if (fileSizeStr.includes('KB')) {
                            fileSize = parseFloat(fileSizeStr) * 1024;
                        } else if (fileSizeStr.includes('MB')) {
                            fileSize = parseFloat(fileSizeStr) * 1024 * 1024;
                        } else if (fileSizeStr.includes('GB')) {
                            fileSize = parseFloat(fileSizeStr) * 1024 * 1024 * 1024;
                        } else {
                            fileSize = parseInt(fileSizeStr);
                        }
                        
                        const log = {
                            time,
                            fileName,
                            fileSize,
                            status,
                            apiResponse
                        };
                        
                        if (status === 'success') {
                            const urlMatch = lines[i].match(/URL: (.*)/);
                            if (urlMatch) log.url = urlMatch[1];
                        } else {
                            const errorMatch = lines[i].match(/错误: (.*)/);
                            if (errorMatch) log.error = errorMatch[1];
                        }
                        
                        newLogs.push(log);
                        if (apiResponseLine) i++; // 跳过API响应行
                    }
                    
                    logs = [...newLogs, ...logs].slice(0, 100); // 保留最新的100条
                    saveLogs();
                    renderLogs();
                    alert(`成功导入 ${newLogs.length} 条日志`);
                } catch (error) {
                    alert('导入日志失败: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    function clearLogs() {
        if (confirm('确定要清空所有上传日志吗？')) {
            logs = [];
            saveLogs();
            renderLogs();
        }
    }
    
    // 下载并合并分块文件
    function downloadAndMerge() {
        const inputText = chunkUrlInput.value.trim();
        if (!inputText) {
            alert('请输入分块文件的链接');
            return;
        }
        
        try {
            // 解析链接：base64加密文本.文件名.后缀
            const lastDotIndex = inputText.lastIndexOf('.');
            const firstDotIndex = inputText.indexOf('.');
            
            if (firstDotIndex === -1 || lastDotIndex === -1 || firstDotIndex === lastDotIndex) {
                alert('无效的链接格式，应为：加密文本.文件名.后缀');
                return;
            }
            
            const base64String = inputText.substring(0, firstDotIndex);
            const fileName = inputText.substring(firstDotIndex + 1, lastDotIndex);
            const fileExtension = inputText.substring(lastDotIndex + 1);
            
            const fullFileName = `${fileName}.${fileExtension}`;
            
            // 解码base64
            const chunkUrlsStr = atob(base64String);
            const chunkUrls = chunkUrlsStr.split(',');
            if (chunkUrls.length !== 5) {
                alert('无效的分块链接，需要5个分块');
                return;
            }
            
            // 下载所有分块
            downloadChunkBtn.disabled = true;
            downloadChunkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 下载中...';
            downloadMessage.style.display = 'none';
            
            Promise.all(chunkUrls.map(url => fetch(url).then(res => res.blob())))
                .then(blobs => {
                    // 合并blob
                    const mergedBlob = new Blob(blobs);
                    const url = URL.createObjectURL(mergedBlob);
                    
                    // 创建下载链接
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fullFileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    downloadChunkBtn.disabled = false;
                    downloadChunkBtn.innerHTML = '<i class="fas fa-download"></i> 下载并合并';
                    downloadMessage.style.display = 'block';
                    
                    // 3秒后隐藏消息
                    setTimeout(() => {
                        downloadMessage.style.display = 'none';
                    }, 3000);
                })
                .catch(error => {
                    alert('下载分块失败: ' + error.message);
                    downloadChunkBtn.disabled = false;
                    downloadChunkBtn.innerHTML = '<i class="fas fa-download"></i> 下载并合并';
                });
        } catch (error) {
            alert('解码失败: ' + error.message);
            downloadChunkBtn.disabled = false;
            downloadChunkBtn.innerHTML = '<i class="fas fa-download"></i> 下载并合并';
        }
    }
});