document.addEventListener('DOMContentLoaded', function() {
            const uploadArea = document.getElementById('uploadArea');
            const fileInput = document.getElementById('fileInput');
            const browseBtn = document.getElementById('browseBtn');
            const previewContainer = document.getElementById('previewContainer');
            const previewImage = document.getElementById('previewImage');
            const fileName = document.getElementById('fileName');
            const fileSize = document.getElementById('fileSize');
            const uploadBtn = document.getElementById('uploadBtn');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const resultContainer = document.getElementById('resultContainer');
            const imageUrl = document.getElementById('imageUrl');
            const copyBtn = document.getElementById('copyBtn');
            const successMessage = document.getElementById('successMessage');
            const historyList = document.getElementById('historyList');
            const emptyHistory = document.getElementById('emptyHistory');
            const exportHistoryBtn = document.getElementById('exportHistory');
            const importHistoryBtn = document.getElementById('importHistory');
            const clearHistoryBtn = document.getElementById('clearHistory');
            const logsList = document.getElementById('logsList');
            const emptyLogs = document.getElementById('emptyLogs');
            const exportLogsBtn = document.getElementById('exportLogs');
            const importLogsBtn = document.getElementById('importLogs');
            const clearLogsBtn = document.getElementById('clearLogs');
            const hamburger = document.getElementById('hamburger');
            const navLinks = document.getElementById('navLinks');
            
            let selectedFile = null;
            
            loadHistory();
            loadLogs();
            
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
                imageUrl.select();
                document.execCommand('copy');
                
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 2000);
            });
            
            exportHistoryBtn.addEventListener('click', exportHistory);
            
            importHistoryBtn.addEventListener('click', () => {
                const importInput = document.createElement('input');
                importInput.type = 'file';
                importInput.accept = '.txt';
                importInput.onchange = (e) => importHistory(e.target.files[0]);
                importInput.click();
            });
            
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('确定要清空所有上传历史吗？')) {
                    localStorage.removeItem('uploadHistory');
                    historyList.innerHTML = '';
                    emptyHistory.style.display = 'flex';
                }
            });
            
            exportLogsBtn.addEventListener('click', exportLogs);
            
            importLogsBtn.addEventListener('click', () => {
                const importInput = document.createElement('input');
                importInput.type = 'file';
                importInput.accept = '.txt';
                importInput.onchange = (e) => importLogs(e.target.files[0]);
                importInput.click();
            });
            
            clearLogsBtn.addEventListener('click', () => {
                if (confirm('确定要清空所有操作日志吗？')) {
                    localStorage.removeItem('uploadLogs');
                    logsList.innerHTML = '';
                    emptyLogs.style.display = 'flex';
                }
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
                
                const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    alert('请选择有效的图片文件 (JPG, PNG, GIF, WEBP)');
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    alert('文件大小不能超过5MB');
                    return;
                }
                
                selectedFile = file;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    previewContainer.style.display = 'flex';
                };
                reader.readAsDataURL(file);
                
                fileName.textContent = file.name;
                fileSize.textContent = formatFileSize(file.size);
                
                uploadBtn.disabled = false;
            }
            
            function uploadFile() {
                if (!selectedFile) return;
                
                uploadBtn.disabled = true;
                
                progressContainer.style.display = 'flex';
                progressBar.style.width = '0%';
                progressText.textContent = '上传中: 0%';
                
                const formData = new FormData();
                formData.append('file', selectedFile);
                
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        progressBar.style.width = `${percent}%`;
                        progressText.textContent = `上传中: ${percent}%`;
                    }
                });
                
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.url) {
                                imageUrl.value = response.url;
                                resultContainer.style.display = 'flex';
                                
                                addToHistory(response.url, selectedFile.name);
                                
                                addToLogs(response);
                            } else {
                                throw new Error('无效的响应');
                            }
                        } catch (e) {
                            alert('上传失败: 服务器返回无效响应');
                        }
                    } else {
                        alert(`上传失败: ${xhr.statusText}`);
                    }
                    
                    progressContainer.style.display = 'none';
                    uploadBtn.disabled = false;
                });
                
                xhr.addEventListener('error', () => {
                    alert('上传失败: 网络错误');
                    progressContainer.style.display = 'none';
                    uploadBtn.disabled = false;
                });
                
                xhr.open('POST', 'https://api.pgaot.com/user/up_cat_file');
                xhr.send(formData);
            }
            
            function addToHistory(url, filename) {
                const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
                
                const newRecord = {
                    url: url,
                    filename: filename,
                    timestamp: new Date().toISOString()
                };
                
                history.unshift(newRecord);
                
                localStorage.setItem('uploadHistory', JSON.stringify(history.slice(0, 10000)));
                
                loadHistory();
            }
            
            function addToLogs(response) {
                const logs = JSON.parse(localStorage.getItem('uploadLogs') || '[]');
                
                const newLog = {
                    timestamp: new Date().toISOString(),
                    response: response
                };
                
                logs.unshift(newLog);
                
                localStorage.setItem('uploadLogs', JSON.stringify(logs.slice(0, 10000)));
                
                loadLogs();
            }
            
            function loadHistory() {
                const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
                historyList.innerHTML = '';
                
                if (history.length === 0) {
                    emptyHistory.style.display = 'flex';
                    return;
                }
                
                emptyHistory.style.display = 'none';
                
                history.forEach((record, index) => {
                    const item = document.createElement('div');
                    item.className = 'history-item';
                    
                    const date = new Date(record.timestamp);
                    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    
                    item.innerHTML = `
                        <img src="${record.url}" alt="${record.filename}" class="history-thumbnail">
                        <div class="history-details">
                            <div class="history-url">${record.url}</div>
                            <div class="history-time">${formattedDate}</div>
                        </div>
                        <div class="item-actions">
                            <button class="item-btn copy" data-url="${record.url}">复制</button>
                            <button class="item-btn delete" data-index="${index}">删除</button>
                        </div>
                    `;
                    
                    historyList.appendChild(item);
                });
                
                document.querySelectorAll('.item-btn.copy').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const url = e.target.getAttribute('data-url');
                        copyToClipboard(url);
                        
                        const success = document.createElement('div');
                        success.className = 'success-message';
                        success.innerHTML = '<i class="fas fa-check-circle"></i> 链接已复制';
                        e.target.parentElement.appendChild(success);
                        
                        setTimeout(() => {
                            success.remove();
                        }, 2000);
                    });
                });
                
                document.querySelectorAll('.item-btn.delete').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.target.getAttribute('data-index'));
                        deleteHistoryItem(index);
                    });
                });
            }
            
            function deleteHistoryItem(index) {
                const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
                if (index >= 0 && index < history.length) {
                    history.splice(index, 1);
                    localStorage.setItem('uploadHistory', JSON.stringify(history));
                    loadHistory();
                }
            }
            
            function loadLogs() {
                const logs = JSON.parse(localStorage.getItem('uploadLogs') || '[]');
                logsList.innerHTML = '';
                
                if (logs.length === 0) {
                    emptyLogs.style.display = 'flex';
                    return;
                }
                
                emptyLogs.style.display = 'none';
                
                logs.forEach((log, index) => {
                    const logItem = document.createElement('div');
                    logItem.className = 'log-item';
                    
                    const date = new Date(log.timestamp);
                    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
                    
                    const formattedResponse = JSON.stringify(log.response, null, 2);
                    
                    logItem.innerHTML = `
                        <div class="log-time">${formattedDate}</div>
                        <div class="log-content">${formattedResponse}</div>
                        <button class="log-delete" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    logsList.appendChild(logItem);
                });
                
                document.querySelectorAll('.log-delete').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(btn.getAttribute('data-index'));
                        deleteLogItem(index);
                    });
                });
            }
            
            function deleteLogItem(index) {
                const logs = JSON.parse(localStorage.getItem('uploadLogs') || '[]');
                if (index >= 0 && index < logs.length) {
                    logs.splice(index, 1);
                    localStorage.setItem('uploadLogs', JSON.stringify(logs));
                    loadLogs();
                }
            }
            
            function exportHistory() {
                const history = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
                if (history.length === 0) {
                    alert('没有历史记录可导出');
                    return;
                }
                
                let content = '';
                history.forEach(record => {
                    const date = new Date(record.timestamp);
                    const formattedDate = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    content += `${formattedDate} [${record.url}]\n`;
                });
                
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                const now = new Date();
                const formattedTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `ModernLink_History_${formattedTime}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            function importHistory(file) {
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    const lines = content.split('\n');
                    const existingHistory = JSON.parse(localStorage.getItem('uploadHistory') || '[]');
                    
                    const existingUrls = new Set(existingHistory.map(item => item.url));
                    let importedCount = 0;
                    
                    lines.forEach(line => {
                        if (line.trim() === '') return;
                        
                        const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) \[(https?:\/\/[^\]]+)\]$/);
                        if (match) {
                            const dateStr = match[1];
                            const url = match[2];
                            
                            if (existingUrls.has(url)) return;
                            
                            const dateParts = dateStr.split(' ');
                            const date = new Date(`${dateParts[0]}T${dateParts[1]}:00`);
                            
                            if (!isNaN(date.getTime())) {
                                existingHistory.push({
                                    url: url,
                                    filename: url.split('/').pop() || 'image',
                                    timestamp: date.toISOString()
                                });
                                
                                existingUrls.add(url);
                                importedCount++;
                            }
                        }
                    });
                    
                    localStorage.setItem('uploadHistory', JSON.stringify(existingHistory.slice(0, 10000)));
                    loadHistory();
                    alert(`成功导入 ${importedCount} 条历史记录`);
                };
                
                reader.readAsText(file);
            }
            
            function exportLogs() {
                const logs = JSON.parse(localStorage.getItem('uploadLogs') || '[]');
                if (logs.length === 0) {
                    alert('没有操作日志可导出');
                    return;
                }
                
                const content = JSON.stringify(logs, null, 2);
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                const now = new Date();
                const formattedTime = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `ModernLink_Logs_${formattedTime}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            function importLogs(file) {
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const logs = JSON.parse(e.target.result);
                        if (!Array.isArray(logs)) {
                            throw new Error('无效的日志格式');
                        }
                        
                        const existingLogs = JSON.parse(localStorage.getItem('uploadLogs') || '[]');
                        
                        const newLogs = [...logs, ...existingLogs].slice(0, 10000);
                        
                        localStorage.setItem('uploadLogs', JSON.stringify(newLogs));
                        loadLogs();
                        alert(`成功导入 ${logs.length} 条操作日志`);
                    } catch (error) {
                        alert('导入失败: 文件格式不正确');
                    }
                };
                
                reader.readAsText(file);
            }
            
            function copyToClipboard(text) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            
            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }
        });
