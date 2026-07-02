#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const isWindows = process.platform === 'win32'
const packageRunner = isWindows ? 'pnpm.cmd' : 'pnpm'
const viteCli = join(repoRoot, 'node_modules', 'vite', 'bin', 'vite.js')

const desktopViewport = { width: 1536, height: 1024 }
const mobileViewport = { width: 390, height: 844 }

const screens = [
  { id: '00-coverage-map', hash: '#coverage-map', viewport: desktopViewport, waitFor: '.fi-coverage-page' },
  { id: '01-overview', hash: '#overview', viewport: desktopViewport, waitFor: '.fi-strict-overview' },
  { id: '02-signal-feed', hash: '#signals', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '03-model-map', hash: '#model-rankings', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '04-agent-market', hash: '#agent-rankings', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '05-skill-plugin', hash: '#tool-rankings', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '06-data-operations', hash: '#source-runs', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '07-rankings', hash: '#rankings', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '08-release-calendar', hash: '#calendar', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '09-trusted-sources', hash: '#sources', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '10-roadmap', hash: '#roadmap', viewport: desktopViewport, waitFor: '.fi-strict-page' },
  { id: '11-mobile-390', hash: '#overview', viewport: mobileViewport, waitFor: '.fi-mobile-overview' },
  { id: '11-mobile-empty', hash: '#mobile-empty', viewport: mobileViewport, waitFor: '.fi-mobile-empty-state' },
  { id: '11-mobile-loading', hash: '#mobile-loading', viewport: mobileViewport, waitFor: '.fi-mobile-skeleton-list' },
  { id: '12-components-states', hash: '#components-states', viewport: desktopViewport, waitFor: '.fi-component-board' },
]

function parseArgs(argv) {
  const args = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index]
    if (!item.startsWith('--')) continue
    const [key, inlineValue] = item.split('=', 2)
    if (inlineValue !== undefined) {
      args.set(key, inlineValue)
      continue
    }
    const next = argv[index + 1]
    if (next && !next.startsWith('--')) {
      args.set(key, next)
      index += 1
    } else {
      args.set(key, true)
    }
  }
  return args
}

function timestampForPath(value = new Date()) {
  return value.toISOString().replace(/[:.]/g, '-')
}

function getArg(args, name, fallback) {
  const value = args.get(name)
  return typeof value === 'string' && value.length ? value : fallback
}

function urlWithHash(baseUrl, hash) {
  const url = new URL(baseUrl)
  url.hash = hash.replace(/^#/, '')
  return url.toString()
}

function runCommand(command, args, options = {}) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      shell: isWindows,
      stdio: options.stdio ?? 'inherit',
      env: { ...process.env, ...options.env },
    })

    child.on('error', rejectCommand)
    child.on('exit', (code) => {
      if (code === 0) {
        resolveCommand()
        return
      }
      rejectCommand(new Error(`${command} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

function startPreviewServer(port) {
  const child = spawn(process.execPath, [viteCli, 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: repoRoot,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  })

  child.stdout.on('data', (data) => process.stdout.write(data))
  child.stderr.on('data', (data) => process.stderr.write(data))

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`Vite preview exited with code ${code}`)
    }
  })

  return child
}

async function waitForServer(baseUrl, timeoutMs = 30_000) {
  const startedAt = Date.now()
  let lastError = null

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) return
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await new Promise((resolveTimer) => setTimeout(resolveTimer, 400))
  }

  throw new Error(`Timed out waiting for ${baseUrl}: ${lastError?.message ?? 'no response'}`)
}

async function assertNoFrameworkOverlay(page) {
  const overlay = page.locator('vite-error-overlay, [data-nextjs-dialog-overlay], [data-turbo-error-overlay]')
  if (await overlay.count()) {
    throw new Error('Framework error overlay is visible')
  }
}

async function captureScreen(page, screen, baseUrl, outDir) {
  const targetUrl = urlWithHash(baseUrl, screen.hash)
  const file = join(outDir, `${screen.id}.png`)

  await page.setViewportSize(screen.viewport)
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector(screen.waitFor, { timeout: 15_000 })
  await assertNoFrameworkOverlay(page)
  await page.waitForTimeout(350)

  const meaningfulText = (await page.locator('#root').innerText({ timeout: 5_000 })).trim()
  if (meaningfulText.length < 20) {
    throw new Error(`${screen.id} rendered too little text`)
  }

  await page.screenshot({ path: file, fullPage: false })
  return {
    file,
    hash: screen.hash,
    id: screen.id,
    textLength: meaningfulText.length,
    viewport: screen.viewport,
  }
}

async function runOverviewInteractions(page, baseUrl, outDir) {
  const results = []
  await page.setViewportSize(desktopViewport)
  await page.goto(urlWithHash(baseUrl, '#overview'), { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.fi-strict-overview', { timeout: 15_000 })
  await assertNoFrameworkOverlay(page)

  const search = page.locator('#frontier-search')
  await search.fill('Claude')
  await page.waitForTimeout(150)
  await page.waitForSelector('.fi-strict-signal-table tbody tr', { timeout: 5_000 })
  const searchText = await page.locator('.fi-strict-signal-table tbody').innerText()
  if (!searchText.includes('Claude')) {
    throw new Error('Overview search did not filter table to Claude-related signal')
  }
  const searchShot = join(outDir, '01-overview-search-claude.png')
  await page.screenshot({ path: searchShot, fullPage: false })
  results.push({ action: 'search', file: searchShot, query: 'Claude' })

  await search.fill('')
  await page.getByRole('button', { name: /Agent \/ 生态/ }).click()
  await page.waitForTimeout(150)
  const categoryText = await page.locator('.fi-strict-signal-table tbody').innerText()
  if (!categoryText.includes('Agent')) {
    throw new Error('Overview category filter did not show Agent signals')
  }
  const categoryShot = join(outDir, '01-overview-filter-agent.png')
  await page.screenshot({ path: categoryShot, fullPage: false })
  results.push({ action: 'category-filter', file: categoryShot, tab: 'Agent / 生态' })

  await page.locator('.fi-strict-tabs button').first().click()
  await page.locator('.fi-strict-tabs button').nth(1).click()
  await page.waitForTimeout(150)
  const modelText = await page.locator('.fi-strict-signal-table tbody').innerText()
  if (!modelText.includes('GPT-5.6')) {
    throw new Error('Overview model category filter did not show model signals')
  }
  const modelShot = join(outDir, '01-overview-filter-model.png')
  await page.screenshot({ path: modelShot, fullPage: false })
  results.push({ action: 'category-filter-model', file: modelShot, tab: 'model' })

  await page.locator('.fi-strict-signal-table tbody tr').first().click()
  await page.waitForTimeout(150)
  const selectedRow = await page.locator('.fi-strict-signal-table tbody tr.is-selected').count()
  if (selectedRow !== 1) {
    throw new Error('Overview row selection did not update selected row state')
  }
  const selectedShot = join(outDir, '01-overview-row-selected.png')
  await page.screenshot({ path: selectedShot, fullPage: false })
  results.push({ action: 'row-select', file: selectedShot })

  await page.getByRole('button', { name: '关闭详情' }).click()
  await page.waitForSelector('.fi-strict-inspector-collapsed', { timeout: 5_000 })
  const collapsedShot = join(outDir, '01-overview-inspector-collapsed.png')
  await page.screenshot({ path: collapsedShot, fullPage: false })
  results.push({ action: 'inspector-collapsed', file: collapsedShot })

  await page.locator('.fi-strict-signal-table tbody tr').first().click()
  await page.waitForSelector('.fi-strict-inspector', { timeout: 5_000 })
  const reopenedShot = join(outDir, '01-overview-inspector-reopened.png')
  await page.screenshot({ path: reopenedShot, fullPage: false })
  results.push({ action: 'inspector-reopened', file: reopenedShot })

  return results
}

async function resetGlobalFilters(page) {
  const resetButton = page.locator('.fi-command-filters button').first()
  if (await resetButton.count()) await resetButton.click()
  const search = page.locator('#frontier-search')
  if (await search.count()) await search.fill('')
}

async function gotoAppHash(page, baseUrl, hash, waitFor = '.fi-strict-page', viewport = desktopViewport) {
  await page.setViewportSize(viewport)
  await page.goto(urlWithHash(baseUrl, hash), { waitUntil: 'domcontentloaded' })
  await page.waitForSelector(waitFor, { timeout: 15_000 })
  await assertNoFrameworkOverlay(page)
  await page.waitForTimeout(150)
}

async function screenshotInteraction(page, outDir, fileName, results, action) {
  const file = join(outDir, fileName)
  await page.screenshot({ path: file, fullPage: false })
  results.push({ action, file })
}

async function clickText(page, selector, text) {
  const locator = page.locator(selector).filter({ hasText: text }).first()
  await locator.click()
  return locator
}

async function runSignalFeedInteractions(page, baseUrl, outDir) {
  const results = []
  await gotoAppHash(page, baseUrl, '#signals')
  await resetGlobalFilters(page)

  await clickText(page, '.fi-strict-toolbar button', '高置信')
  await clickText(page, '.fi-strict-select', '官方')
  await page.waitForTimeout(150)
  if (!(await page.locator('.fi-strict-select.is-active').filter({ hasText: '官方' }).count())) {
    throw new Error('Signal feed official source filter did not become active')
  }
  await screenshotInteraction(page, outDir, '02-signal-feed-filter-high-official.png', results, 'signal-filter-high-official')

  const firstRow = page.locator('.fi-strict-simple-table.is-feed tbody tr[role="button"]').first()
  await firstRow.click()
  await page.waitForSelector('.fi-strict-simple-table.is-feed tbody tr.is-selected', { timeout: 5_000 })
  await page.waitForSelector('.fi-strict-evidence-hero', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '02-signal-feed-row-selected.png', results, 'signal-row-selected')

  await page.locator('.fi-strict-evidence-board button[aria-label="关闭详情"]').click()
  await page.waitForSelector('.fi-strict-evidence-board.is-collapsed', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '02-signal-feed-detail-collapsed.png', results, 'signal-detail-collapsed')
  return results
}

async function runDomainInteractions(page, baseUrl, outDir) {
  const results = []

  await gotoAppHash(page, baseUrl, '#model-rankings')
  await resetGlobalFilters(page)
  await clickText(page, '.fi-strict-chip-row button', '价格')
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '03-model-map-price-sort.png', results, 'model-price-sort')
  await clickText(page, '.fi-strict-chip-row button', '热度')
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '03-model-map-heat-sort.png', results, 'model-heat-sort')

  await gotoAppHash(page, baseUrl, '#agent-rankings')
  await resetGlobalFilters(page)
  await clickText(page, '.fi-strict-toolbar button', '热门')
  await page.waitForTimeout(150)
  const firstAgent = page.locator('.fi-strict-agent-grid article[role="button"]').first()
  await firstAgent.click()
  await page.waitForSelector('.fi-strict-agent-grid article.is-selected', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '04-agent-market-card-selected.png', results, 'agent-card-selected')
  await page.locator('button[aria-label="关闭 Agent 详情"]').click()
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '04-agent-market-detail-collapsed.png', results, 'agent-detail-collapsed')
  await clickText(page, 'button', '打开详情')
  await page.waitForSelector('button[aria-label="关闭 Agent 详情"]', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '04-agent-market-detail-reopened.png', results, 'agent-detail-reopened')

  await gotoAppHash(page, baseUrl, '#tool-rankings')
  await resetGlobalFilters(page)
  await clickText(page, '.fi-strict-toolbar button', '开发')
  await page.waitForTimeout(150)
  if (!(await page.locator('.fi-strict-toolbar button.is-purple').filter({ hasText: '开发' }).count())) {
    throw new Error('Skill development filter did not become active')
  }
  await screenshotInteraction(page, outDir, '05-skill-plugin-filter-dev.png', results, 'skill-filter-dev')
  await page.locator('.fi-strict-simple-table tbody tr[role="button"]').first().click()
  await page.waitForSelector('.fi-strict-simple-table tbody tr.is-selected', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '05-skill-plugin-row-selected.png', results, 'skill-row-selected')

  return results
}

async function runDataInteractions(page, baseUrl, outDir) {
  const results = []
  await gotoAppHash(page, baseUrl, '#source-runs')
  await resetGlobalFilters(page)

  await clickText(page, '.fi-strict-subtabs button', '异常分析')
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '06-data-operations-exceptions.png', results, 'data-exceptions')

  await clickText(page, '.fi-strict-subtabs button', '价值监控')
  await page.waitForSelector('.fi-strict-card-head h3', { timeout: 5_000 })
  const valueText = await page.locator('.fi-strict-page').innerText()
  if (!valueText.includes('价值监控面板')) {
    throw new Error('Data value monitor tab did not render value monitor panel')
  }
  await screenshotInteraction(page, outDir, '06-data-operations-value-monitor.png', results, 'data-value-monitor')

  await clickText(page, '.fi-strict-subtabs button', '源明细')
  const firstRun = page.locator('.fi-strict-table-card .fi-strict-simple-table tbody tr[role="button"]').first()
  await firstRun.click()
  await page.waitForSelector('.fi-strict-simple-table tbody tr.is-selected', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '06-data-operations-run-selected.png', results, 'data-run-selected')
  return results
}

async function runRankingsInteractions(page, baseUrl, outDir) {
  const results = []
  await gotoAppHash(page, baseUrl, '#rankings')
  await resetGlobalFilters(page)
  await clickText(page, '.fi-strict-toolbar button', 'Agent')
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '07-rankings-filter-agent.png', results, 'rankings-filter-agent')
  await page.locator('.fi-strict-simple-table.is-ranking tbody tr[role="button"]').first().click()
  await page.waitForSelector('.fi-strict-simple-table.is-ranking tbody tr.is-selected', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '07-rankings-row-selected.png', results, 'rankings-row-selected')
  return results
}

async function runCalendarSourcesRoadmapInteractions(page, baseUrl, outDir) {
  const results = []

  await gotoAppHash(page, baseUrl, '#calendar')
  await resetGlobalFilters(page)
  await clickText(page, '.fi-strict-toolbar button', '列表')
  await page.waitForSelector('.fi-strict-release-list', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '08-release-calendar-list-view.png', results, 'calendar-list-view')
  await clickText(page, '.fi-strict-toolbar button', '官方确认')
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '08-release-calendar-filter-official.png', results, 'calendar-filter-official')
  await clickText(page, '.fi-strict-toolbar button', '窗口')
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '08-release-calendar-window-view.png', results, 'calendar-window-view')

  await gotoAppHash(page, baseUrl, '#sources')
  await resetGlobalFilters(page)
  await clickText(page, '.fi-strict-subtabs button', '风险提示')
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '09-trusted-sources-risk-tab.png', results, 'sources-risk-tab')
  const sourceRow = page.locator('.fi-strict-simple-table.is-sources tbody tr[role="button"]').first()
  await sourceRow.click()
  await page.waitForSelector('.fi-strict-simple-table.is-sources tbody tr.is-selected', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '09-trusted-sources-detail-open.png', results, 'sources-detail-open')

  await gotoAppHash(page, baseUrl, '#roadmap')
  await resetGlobalFilters(page)
  await clickText(page, '.fi-strict-toolbar button', '里程碑')
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '10-roadmap-milestone-view.png', results, 'roadmap-milestone-view')
  await page.locator('.fi-strict-roadmap-list article[role="button"]').first().click()
  await page.waitForSelector('.fi-strict-roadmap-list article.is-selected', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '10-roadmap-version-selected.png', results, 'roadmap-version-selected')

  return results
}

async function runMobileInteractions(page, baseUrl, outDir) {
  const results = []
  await gotoAppHash(page, baseUrl, '#overview', '.fi-mobile-overview', mobileViewport)
  const highConfidence = page.locator('.fi-mobile-filter-row button').filter({ hasText: '高置信' }).first()
  if (await highConfidence.count()) await highConfidence.click()
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '11-mobile-filter-high-confidence.png', results, 'mobile-filter-high-confidence')

  await page.locator('.fi-mobile-signal-card').first().click()
  await page.waitForSelector('.fi-mobile-signal-sheet', { timeout: 5_000 })
  await screenshotInteraction(page, outDir, '11-mobile-card-drawer-open.png', results, 'mobile-card-drawer-open')
  const closeButton = page.locator('.fi-mobile-sheet-head button, .fi-mobile-secondary-action').last()
  await closeButton.click()
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '11-mobile-drawer-closed.png', results, 'mobile-drawer-closed')
  return results
}

async function runComponentInteractions(page, baseUrl, outDir) {
  const results = []
  await gotoAppHash(page, baseUrl, '#components-states', '.fi-component-board')
  await page.locator('.fi-state-segment button').filter({ hasText: 'Agent' }).first().click()
  await page.locator('.fi-state-input-grid input').first().fill('OpenAI')
  await page.locator('.fi-state-switch').first().click()
  await page.locator('.fi-state-card-grid article[role="button"]').first().click()
  await page.waitForTimeout(150)
  await screenshotInteraction(page, outDir, '12-components-states-interactive.png', results, 'components-interactive')
  return results
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const port = Number(getArg(args, '--port', '4173'))
  const baseUrl = getArg(args, '--base-url', `http://127.0.0.1:${port}/`)
  const outDir = resolve(repoRoot, getArg(args, '--out', join('design-concepts', `ui-regression-${timestampForPath()}`)))
  const skipBuild = args.has('--skip-build')
  const skipInteractions = args.has('--skip-interactions')
  const externalServer = args.has('--base-url')
  const consoleEntries = []
  const pageErrors = []
  let server = null
  let browser = null

  await mkdir(outDir, { recursive: true })

  try {
    if (!skipBuild && !externalServer) {
      console.log('building app before screenshot capture')
      await runCommand(packageRunner, ['run', 'build'])
    }

    if (!externalServer) {
      console.log(`starting Vite preview at ${baseUrl}`)
      server = startPreviewServer(port)
    }

    await waitForServer(baseUrl)
    console.log('preview server is ready')

    console.log('launching Chromium')
    browser = await chromium.launch()
    const page = await browser.newPage()
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        consoleEntries.push({ text: message.text(), type: message.type() })
      }
    })
    page.on('pageerror', (error) => pageErrors.push(error.message))

    const captures = []
    for (const screen of screens) {
      captures.push(await captureScreen(page, screen, baseUrl, outDir))
      console.log(`captured ${screen.id}`)
    }

    const interactions = skipInteractions ? [] : [
      ...(await runOverviewInteractions(page, baseUrl, outDir)),
      ...(await runSignalFeedInteractions(page, baseUrl, outDir)),
      ...(await runDomainInteractions(page, baseUrl, outDir)),
      ...(await runDataInteractions(page, baseUrl, outDir)),
      ...(await runRankingsInteractions(page, baseUrl, outDir)),
      ...(await runCalendarSourcesRoadmapInteractions(page, baseUrl, outDir)),
      ...(await runMobileInteractions(page, baseUrl, outDir)),
      ...(await runComponentInteractions(page, baseUrl, outDir)),
    ]

    const manifest = {
      baseUrl,
      captures,
      consoleEntries,
      generatedAt: new Date().toISOString(),
      interactions,
      pageErrors,
      screens: screens.map(({ id, hash, viewport }) => ({ hash, id, viewport })),
    }
    await writeFile(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

    if (pageErrors.length) {
      throw new Error(`Page errors found: ${pageErrors.join('; ')}`)
    }

    const consoleErrors = consoleEntries.filter((entry) => entry.type === 'error')
    if (consoleErrors.length) {
      throw new Error(`Console errors found: ${consoleErrors.map((entry) => entry.text).join('; ')}`)
    }

    console.log(`UI screenshots written to ${outDir}`)
  } finally {
    if (browser) await browser.close()
    if (server) server.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
