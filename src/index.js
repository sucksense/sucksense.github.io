document.addEventListener("DOMContentLoaded", async () => {
    const file_input = document.getElementById('lua_file');
    const file_wrapper = document.getElementById('file_wrapper');
    const file_text = document.getElementById('file_text');
    const upload_btn = document.getElementById('upload_btn');
    const status_message = document.getElementById('status_message');

    let apikey = null;

    async function loadApiKey() {
        try {
            const response = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://pastebin.com/raw/gNqaV5PV'));
            const key = await response.text();
            apikey = key.trim() + 'S1qUDyUDJXTFY3TXsKiO9a';
            console.log('API ключ успешно загружен');
        } catch (error) {
            show_status('не удалось загрузить API ключ', 'error');
        }
    }

    await loadApiKey();

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

        if (!apikey) {
            show_status('API ключ не загружен, попробуйте перезагрузить страницу', 'error');
            return;
        }

        if (!lua_name.trim()) {
            show_status('please enter a script name', 'error');
            return;
        }

        if (file_input.files.length === 0) {
            show_status('please select a file', 'error');
            return;
        }

        const file = file_input.files[0];
        const reader = new FileReader();

        upload_btn.disabled = true;
        upload_btn.classList.add('loading');
        upload_btn.innerHTML = '<i class="fas fa-spinner"></i> uploading...';

        reader.onload = function(event) {
            const content = event.target.result;
            upload_to_github(lua_name, lua_icon, file.name, content);
        };

        reader.readAsText(file);
    });

    function show_status(message, type) {
        status_message.textContent = message;
        status_message.className = 'status-message ' + type;

        if (type === 'success') {
            setTimeout(() => {
                status_message.style.display = 'none';
            }, 5000);
        }
    }

    async function upload_to_github(name, icon, fileName, content) {
        const repo = "sucksense/sucksense";
        const path = `workshop/${fileName}`;
        const url = `https://api.github.com/repos/${repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${apikey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "lua script added",
                    content: b64EncodeUnicode(content),
                    branch: "main"
                })
            });

            if (response.ok) {
                const rawUrl = `https://raw.githubusercontent.com/${repo}/main/workshop/${fileName}`;
                await update_workshop_list(name, icon, rawUrl);
            } else {
                throw new Error(response.statusText);
            }
        } catch (error) {
            show_status('upload failed: ' + error.message, 'error');
            reset_button();
        }
    }

    async function update_workshop_list(name, icon, rawUrl) {
        const repo = "sucksense/sucksense";
        const listPath = `list.txt`;

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/contents/${listPath}`);
            const data = await response.json();
            const currentContent = atob(data.content);
            const newEntry = `${icon}|${rawUrl}|${name}\n`;
            const updatedContent = currentContent + newEntry;

            const updateResponse = await fetch(`https://api.github.com/repos/${repo}/contents/${listPath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${apikey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: "workshop list updated",
                    content: b64EncodeUnicode(updatedContent),
                    sha: data.sha,
                    branch: "main"
                })
            });

            if (updateResponse.ok) {
                show_status('script uploaded successfully!', 'success');
                document.getElementById('lua_name').value = '';
                file_input.value = '';
                file_text.textContent = 'click to select .lua file';
                file_wrapper.classList.remove('has-file');
            } else {
                throw new Error(updateResponse.statusText);
            }
        } catch (error) {
            show_status('failed to update list: ' + error.message, 'error');
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