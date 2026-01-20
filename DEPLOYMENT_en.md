# Deployment Guide

This guide will help you create a repository using the StarsBoard template and configure the automated workflow.

---

## 1. Use this Template

1. Visit the [StarsBoard repository](https://github.com/JtheWL/StarsBoard)
2. Click the **"Use this template"** button in the top-right corner
3. Select **"Create a new repository"**
4. Enter a repository name (e.g., `my-stars`), choose public or private
5. Click **"Create repository"**

---

## 2. Configure GitHub Secrets

### Required Secrets

#### 2.1 GITHUB_TOKEN

`GITHUB_TOKEN` is automatically provided by GitHub Actions for committing changes to the repository.

**Required Permissions**:
- `repo` (full repository access)
- `contents:write` (to write README.md and data files)

If the workflow fails due to permission issues:
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Click **Save**

#### 2.2 STAR_TOKEN (Required)

`STAR_TOKEN` is a **Personal Access Token (PAT)** required to access your GitHub Stars data.

**Why STAR_TOKEN is needed**:
- The auto-generated `GITHUB_TOKEN` **cannot** access the `/user/starred` API endpoint (returns 403 Forbidden)
- You must use a Personal Access Token with `repo` scope (Classic PAT)

**Creating STAR_TOKEN**:
1. Visit https://github.com/settings/tokens/new
2. Enter a description (e.g., `StarsBoard`)
3. Select the following scopes:
   - `repo` (full repository access)
4. Click **"Generate token"** at the bottom
5. **Copy the generated token immediately** (it's only shown once!)

**Add to Repository Secrets**:
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click the **"New repository secret"** button
3. Enter **Name**: `STAR_TOKEN`
4. Paste your PAT in **Secret**
5. Click **"Add secret"**

#### 2.3 OPENAI_API_KEY

1. Get your OpenAI API Key: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. In your repository, go to **Settings** → **Secrets and variables** → **Actions**
3. Click the **"New repository secret"** button
4. Enter **Name**: `OPENAI_API_KEY`
5. Paste your API Key in **Secret**
6. Click **"Add secret"**

> **Tip**: If you use other OpenAI-compatible API services (such as DeepSeek, Azure OpenAI, etc.), simply enter the corresponding API Key and configure `OPENAI_BASE_URL` in the next step.

---

## 3. Configure Variables (Optional)

You can customize workflow behavior by configuring Variables. Default values will be used if not configured.

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `USERNAME` | GitHub username (usually not needed, auto-detected from repository owner) | Auto-detected |
| `LANGUAGE` | Tag language | `en` |
| `OPENAI_BASE_URL` | AI API endpoint | `https://api.openai.com/v1` |
| `AI_MODEL` | AI model | `gpt-4o` |
| `TAG_COUNT_MIN` | Minimum tags | `3` |
| `TAG_COUNT_MAX` | Maximum tags | `5` |
| `ENABLE_NEW_TAGS` | Allow new tags | `true` |
| `ENABLE_THINKING` | Thinking mode | `false` |
| `BATCH_SIZE` | Batch size | `5` |

### Configuration Steps

1. Go to **Settings** → **Secrets and variables** → **Variables**
2. Click the **"New repository variable"** button
3. Enter **Name** and **Value**
4. Click **"Add variable"**

### Common Configuration Examples

#### Use Chinese Tags

```yaml
Name: LANGUAGE
Value: zh
```

#### Use DeepSeek API

```yaml
Name: OPENAI_BASE_URL
Value: https://api.deepseek.com/v1

Name: AI_MODEL
Value: deepseek-chat
```

#### Use Azure OpenAI

```yaml
Name: OPENAI_BASE_URL
Value: https://your-resource.openai.azure.com/

Name: AI_MODEL
Value: gpt-4o
```

---

## 4. Enable Workflow

1. Go to your repository's **Actions** page
2. If prompted "Actions are disabled", click **"I understand my workflows, go ahead and enable them"**
3. Select **"Update Stars README"** workflow on the left

---

## 5. Manual Trigger

1. On the **Actions** page, select **"Update Stars README"**
2. Click the **"Run workflow"** button on the right
3. Confirm the branch is **main**, click the green **"Run workflow"** button
4. Wait for the workflow to complete (may take several minutes depending on the number of Stars)
5. After completion, refresh the main page to see the generated README

---

## 6. Automated Run

The workflow is configured to run automatically every day at **UTC 0:00**, ensuring your README is always up-to-date.

---

## 7. View Workflow Logs

If the workflow fails, you can view the logs to troubleshoot:

1. Go to the **Actions** page
2. Click on the failed workflow run
3. Expand each step to view detailed logs

---

## 8. Customize Tags

You can customize tags by editing files in your repository:

- **`datas/tags.txt`** - Manage the list of available tags
- **`datas/tag-keywords.json`** - Configure keyword-to-tag mappings

---

## Troubleshooting

### Issue: Workflow fails with "GitHub API error: 403 Forbidden"

**Cause**: Missing `STAR_TOKEN` secret or insufficient token permissions

**Solution**:
1. Follow the steps in [Section 2.2](#22-star_token-required) to create a Personal Access Token
2. Make sure you selected the `repo` scope (Classic PAT)
3. Add the token to repository Secrets as `STAR_TOKEN`
4. Re-run the workflow

### Issue: Workflow fails with "Resource not accessible"

**Cause**: Insufficient `GITHUB_TOKEN` permissions

**Solution**:
1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read and write permissions**
3. Click **Save**

### Issue: Tag generation fails

**Cause**: Invalid `OPENAI_API_KEY` or insufficient API quota

**Solution**:
1. Check if the API Key is correct
2. Check if you have sufficient API quota
3. If using a compatible endpoint, check `OPENAI_BASE_URL` and `AI_MODEL` configuration

### Issue: Tags are in the wrong language

**Cause**: `LANGUAGE` variable is not configured or incorrectly configured

**Solution**:
- Add variable `LANGUAGE` with value `en` (English) or `zh` (Chinese)

---

## Need Help?

- Submit an [Issue](https://github.com/JtheWL/StarsBoard/issues)
- Check [Project Documentation](README.md)
