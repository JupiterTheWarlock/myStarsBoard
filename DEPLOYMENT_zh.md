# 部署指南

本指南将帮助您使用 StarsBoard 模板创建仓库并配置自动化工作流。

---

## 1. 使用模板创建仓库

1. 访问 [StarsBoard 仓库](https://github.com/JtheWL/StarsBoard)
2. 点击右上角的 **"Use this template"** 按钮
3. 选择 **"Create a new repository"**
4. 输入仓库名称（例如：`my-stars`），选择公开或私有
5. 点击 **"Create repository"**

---

## 2. 配置 GitHub Secrets

### 必需的 Secrets

#### 2.1 GITHUB_TOKEN

`GITHUB_TOKEN` 由 GitHub Actions 自动提供，用于提交更改到仓库。

**需要的权限范围**：
- `repo` (完整仓库访问权限)
- `contents:write` (写入 README.md 和数据文件)

如果工作流因权限问题失败，请检查：
1. 进入 **Settings** → **Actions** → **General**
2. 在 **Workflow permissions** 中选择 **Read and write permissions**
3. 点击 **Save**

#### 2.2 STAR_TOKEN（必需）

`STAR_TOKEN` 是一个 **Personal Access Token (PAT)**，用于访问你的 GitHub Stars 数据。

**为什么需要 STAR_TOKEN**：
- GitHub Actions 自动提供的 `GITHUB_TOKEN` **无法**访问 `/user/starred` API 端点（会返回 403 Forbidden）
- 必须使用带有 `repo` 权限的 Personal Access Token（Classic PAT）

**创建 STAR_TOKEN 的步骤**：
1. 访问 https://github.com/settings/tokens/new
2. 输入描述（如：`StarsBoard`）
3. 勾选以下权限：
   - `repo`（完整仓库访问权限）
4. 点击页面底部的 **"Generate token"** 按钮
5. **立即复制生成的 token**（只显示一次！）

**添加到仓库 Secrets**：
1. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **"New repository secret"** 按钮
3. Name 填入：`STAR_TOKEN`
4. Secret 填入刚才复制的 PAT
5. 点击 **"Add secret"**

#### 2.3 OPENAI_API_KEY

1. 获取 OpenAI API Key：访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 在仓库中进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **"New repository secret"** 按钮
4. Name 填入：`OPENAI_API_KEY`
5. Secret 填入你的 API Key
6. 点击 **"Add secret"**

> **提示**：如果使用兼容 OpenAI 的其他服务（如 DeepSeek、Azure OpenAI 等），只需填入对应的 API Key，并在下一步中配置 `OPENAI_BASE_URL`。

---

## 3. 配置 Variables (可选)

你可以通过配置 Variables 来自定义工作流行为。如果不配置，将使用默认值。

### 可选变量列表

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `USERNAME` | GitHub 用户名（通常无需配置，自动获取仓库所有者） | 自动获取 |
| `LANGUAGE` | 标签语言 | `en` |
| `OPENAI_BASE_URL` | AI API 地址 | `https://api.openai.com/v1` |
| `AI_MODEL` | AI 模型 | `gpt-4o` |
| `TAG_COUNT_MIN` | 最少标签数 | `3` |
| `TAG_COUNT_MAX` | 最多标签数 | `5` |
| `ENABLE_NEW_TAGS` | 允许新标签 | `true` |
| `ENABLE_THINKING` | 思考模式 | `false` |
| `BATCH_SIZE` | 批量大小 | `5` |

### 配置步骤

1. 进入 **Settings** → **Secrets and variables** → **Variables**
2. 点击 **"New repository variable"** 按钮
3. 填入 **Name** 和 **Value**
4. 点击 **"Add variable"**

### 常用配置示例

#### 使用中文标签

```yaml
Name: LANGUAGE
Value: zh
```

#### 使用 DeepSeek API

```yaml
Name: OPENAI_BASE_URL
Value: https://api.deepseek.com/v1

Name: AI_MODEL
Value: deepseek-chat
```

#### 使用 Azure OpenAI

```yaml
Name: OPENAI_BASE_URL
Value: https://your-resource.openai.azure.com/

Name: AI_MODEL
Value: gpt-4o
```

---

## 4. 启用工作流

1. 进入仓库的 **Actions** 页面
2. 如果提示 "Actions are disabled"，点击 **"I understand my workflows, go ahead and enable them"**
3. 在左侧选择 **"Update Stars README"** workflow

---

## 5. 手动触发测试

1. 在 **Actions** 页面，选择 **"Update Stars README"**
2. 点击右侧的 **"Run workflow"** 按钮
3. 确认分支为 **main**，点击绿色的 **"Run workflow"** 按钮
4. 等待工作流执行完成（可能需要几分钟，取决于 Stars 数量）
5. 执行完成后，刷新主页查看生成的 README

---

## 6. 自动化运行

工作流配置为每天 **UTC 0:00** 自动运行，确保你的 README 始终是最新的。

---

## 7. 查看工作流日志

如果工作流运行失败，可以查看日志排查问题：

1. 进入 **Actions** 页面
2. 点击失败的工作流运行记录
3. 展开各个步骤查看详细日志

---

## 8. 自定义标签

你可以通过编辑仓库中的文件来自定义标签：

- **`datas/tags.txt`** - 管理可用标签列表
- **`datas/tag-keywords.json`** - 配置关键词到标签的映射

---

## 故障排查

### 问题：工作流失败，提示 "GitHub API error: 403 Forbidden"

**原因**: 缺少 `STAR_TOKEN` secret 或 token 权限不足

**解决**:
1. 按照 [第 2.2 节](#22-star_token必需) 的步骤创建 Personal Access Token
2. 确保勾选了 `repo` 权限（Classic PAT）
3. 将 token 添加到仓库 Secrets，命名为 `STAR_TOKEN`
4. 重新运行工作流

### 问题：工作流失败，提示 "Resource not accessible"

**原因**: `GITHUB_TOKEN` 权限不足

**解决**:
1. 进入 **Settings** → **Actions** → **General**
2. 在 **Workflow permissions** 下选择 **Read and write permissions**
3. 点击 **Save**

### 问题：标签生成失败

**原因**: `OPENAI_API_KEY` 无效或 API 配额不足

**解决**:
1. 检查 API Key 是否正确
2. 检查 API 配额是否充足
3. 如果使用兼容接口，检查 `OPENAI_BASE_URL` 和 `AI_MODEL` 配置

### 问题：标签语言不正确

**原因**: `LANGUAGE` 变量未配置或配置错误

**解决**:
- 添加变量 `LANGUAGE`，值为 `en`（英文）或 `zh`（中文）

---

## 需要帮助？

- 提交 [Issue](https://github.com/JtheWL/StarsBoard/issues)
- 查看 [项目文档](README.md)
