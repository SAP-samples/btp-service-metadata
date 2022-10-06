'use strict'

const { Octokit } = require('@octokit/core')
const { writeFile } = require('fs').promises
const { ensureDir, emptyDir } = require('fs-extra')
const path = require('path')

function getOctokitConfig () {
  const baseUrl = `https://${process.env.GH_ENTERPRISE_API_URL}/api/v3`

  const octokit = new Octokit({
    auth: process.env.GH_ENTERPRISE_TOKEN,
    baseUrl: baseUrl
  })

  return octokit
}

function getOwnerAndRepo () {
  const owner = process.env.METADATA_SOURCE_OWNER
  const repo = process.env.METADATA_SOURCE_REPO

  return { owner, repo }
}

async function createAndCleanDir (dirPath) {
  try {
    await ensureDir(dirPath)
    await emptyDir(dirPath)
  } catch (err) {
    console.error(err)
  }
}

async function fetchAndStoreContent () {
  const sourceDir = process.env.METADATA_SOURCE_DIR
  const sourceVersion = process.env.METADATA_SOURCE_VERSION
  const ghSourcePath = `/${sourceVersion}/${sourceDir}`
  const typeDir = 'dir'

  // Get first level results (directories) from GitHub
  const resultDir = await getContentFromGitHub(ghSourcePath)

  for (const resultEntry of resultDir.data) {
    const pathComp = resultEntry.path.split('/')
    const targetFilePath = path.resolve(__dirname, '..', '..', pathComp[2], pathComp[0])

    if (resultEntry.type === typeDir) {
      // Clean/Create the directories if not existing
      await createAndCleanDir(targetFilePath)
    } else {
      throw new Error('The first level should only contain directories')
    }

    // Get files of the directory from GitHub
    const resultFile = await getContentFromGitHub(resultEntry.path)

    // Fetch and store the files in the directory
    await fetchAndStoreResultsInRepo(resultFile, targetFilePath)
  }
}

async function getContentFromGitHub (sourcePath) {
  // Here we fetch the content from GitHub
  // This can be directories or files and just comprise metadata
  // API: https://docs.github.com/en/enterprise-server@3.5/rest/repos/contents#get-repository-content
  const octokit = getOctokitConfig()
  const { owner, repo } = getOwnerAndRepo()

  try {
    const result = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path: sourcePath
    })

    return result
  } catch (err) {
    console.log(err)
  }
}

async function getBlobFromGitHub (fileSha) {
  // Here we fetch the content of a file as Blob from GitHub
  // The files is always base64 encoded
  // API: https://docs.github.com/en/enterprise-server@3.5/rest/git/blobs#get-a-blob
  const octokit = getOctokitConfig()
  const { owner, repo } = getOwnerAndRepo()

  try {
    const result = await octokit.request('GET /repos/{owner}/{repo}/git/blobs/{file_sha}', {
      owner,
      repo,
      file_sha: fileSha
    })

    return result
  } catch (err) {
    console.log(err)
  }
}

async function handleFileResult (resultEntry, basePath) {
  const fileBlob = await getBlobFromGitHub(resultEntry.sha)

  await storeFile(fileBlob, basePath, resultEntry)
}

async function storeFile (fileBlob, basePath, resultEntry) {
  const fileContentAsJsonString = Buffer.from(fileBlob.data.content, 'base64').toString('utf-8')
  const fileName = path.resolve(basePath, resultEntry.name)

  await writeFile(fileName, fileContentAsJsonString)
  console.log(`File ${resultEntry.name} stored`)
}

async function fetchAndStoreResultsInRepo (result, targetPath) {
  const typeFile = 'file'

  for (const resultEntry of result.data) {
    if (resultEntry.type === typeFile) {
      await handleFileResult(resultEntry, targetPath)
    } else {
      throw new Error('Expected only files in the second level')
    }
  }
}

// Ugly starter of function
(async () => { await fetchAndStoreContent() })()
