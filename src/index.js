document.addEventListener("DOMContentLoaded", () => {
    const file_input = document.getElementById('lua_file');
    const file_wrapper = document.getElementById('file_wrapper');
    const file_text = document.getElementById('file_text');
    const upload_btn = document.getElementById('upload_btn');
    const status_message = document.getElementById('status_message');

    const WORKER_URL = 'github-upload.princesswido1337.workers.dev';

    function b64EncodeUnicode(str) {
        return btoa(
            encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
                String.fromCharCode(parseInt(p1, 16))
            )
        );
    }

    file_input.addEventListener('change', function() {
        if (this.files.length > 0) {
            const fileName = this.files[0].name;
            
            if (!fileName.endsWith('.lua')) {
                show_status('only .lua files are allowed', 'error');
                this.value = '';
                return;
            }
            
            file_text.textContent = fileName;
            file_wrapper.classList.add('has-file');
        } else {
            file_text.textContent = 'click to select .lua file';
            file_wrapper.classList.remove('has-file');
        }
    });

    upload_btn.addEventListener('click', async function() {
        const lua_name = document.getElementById('lua_name').value;
        const lua_icon = document.getElementById('lua_icon').value;

        if (!lua_name.trim()) {
            show_status('please enter a script name', 'error');
            return;
        }

        if (file_input.files.length === 0) {
            show_status('please select a file', 'error');
            return;
        }

        const file = file_input.files[0];
        
        if (file.size > 1024 * 1024) {
            show_status('file too large (max 1MB)', 'error');
            return;
        }

        const reader = new FileReader();

        upload_btn.disabled = true;
        upload_btn.classList.add('loading');
        upload_btn.innerHTML = '<i class="fas fa-spinner"></i> uploading...';

        reader.onload = function(event) {
            const content = event.target.result;
            upload_to_worker(lua_name, lua_icon, file.name, content);
        };

        reader.onerror = function() {
            show_status('failed to read file', 'error');
            reset_button();
        };

        reader.readAsText(file);
    });

    function show_status(message, type) {
        status_message.textContent = message;
        status_message.className = 'status-message ' + type;
        status_message.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                status_message.style.display = 'none';
            }, 5000);
        }
    }

    async function upload_to_worker(name, icon, fileName, content) {
        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lua_name: name,
                    lua_icon: icon || '📜',
                    file_name: fileName,
                    content: b64EncodeUnicode(content)
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                show_status(
                    'script uploaded successfully! it will appear shortly.', 
                    'success'
                );
                
                // Очистить форму
                document.getElementById('lua_name').value = '';
                document.getElementById('lua_icon').value = '';
                file_input.value = '';
                file_text.textContent = 'click to select .lua file';
                file_wrapper.classList.remove('has-file');
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            show_status('upload failed: ' + error.message, 'error');
        } finally {
            reset_button();
        }
    }

    function reset_button() {
        upload_btn.disabled = false;
        upload_btn.classList.remove('loading');
        upload_btn.innerHTML = '<i class="fas fa-upload"></i> upload';
    }
});