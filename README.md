# seckit-cli 🔐

**A secure and efficient command-line tool for file compression, encryption, and upload.**  
Built with Node.js and TypeScript, `seckit-cli` helps developers and power users streamline file processing tasks with a single tool.

---

## ✨ Features

- **Compression**: Compress files or folders to reduce size.
- **Encryption**: Encrypt files using AES-256-GCM encryption with a password.
- **Decryption**: Decrypt AES-256-GCM encrypted files.
- **Upload**: Upload files to remote servers via HTTP POST.
- **Chained Operations**: Seamlessly chain operations like compress → encrypt → upload with flags.

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/sechibuze/seckit-cli.git
cd seckit-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link the CLI globally
npm link
```

## 💻 Usage

### 🔧 Interactive Mode

```bash
seckit-cli
```

## 🔍 Command Mode

### Compress a File or Directory

```bash
seckit-cli compress <path>
```

### Encrypt a File

```bash
seckit-cli encrypt -i <input-file> -p <password> -o <output-file>
```

### Upload a File

```bash
seckit-cli upload -i <input-file> -d <destination-url>
```

## 🔗 Chained Operations

### Chain multiple steps together in one command.

```bash
seckit-cli chain -ceu -i <input-path> -p <password> -d <destination-url>
```

#### Flags:

- -c: Compress
- -e: Encrypt
- -u: Upload

Example:

```bash
seckit-cli process -ceu -i ./my-folder -p strongpass123
```
