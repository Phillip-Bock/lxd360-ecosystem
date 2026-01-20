#!/bin/bash
# =============================================================================
# LXP360-SaaS | WCAG 2.1 AA Accessibility Audit Script
# =============================================================================
#
# This script runs comprehensive accessibility audits using:
# - Lighthouse (accessibility score)
# - axe-core via Playwright (WCAG 2.1 AA violations)
# - pa11y (WCAG 2.1 AA quick checks)
#
# Requirements:
# - Dev server running on http://localhost:3000
# - Node.js packages: lighthouse, pa11y, @axe-core/playwright
#
# Usage:
#   ./scripts/wcag-audit.sh [OPTIONS]
#
# Options:
#   --skip-lighthouse    Skip Lighthouse audits
#   --skip-axe           Skip axe-core Playwright tests
#   --skip-pa11y         Skip pa11y checks
#   --fix                Only run after fixes to verify
#
# =============================================================================

set -e

# Configuration
BASE_URL="${PLAYWRIGHT_TEST_BASE_URL:-http://localhost:3000}"
REPORTS_DIR="./reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Target pages for audit (using actual route paths from app directory)
PAGES=(
    "/:home"
    "/lxp360/pricing:lxp360-pricing"
    "/auth/login:login"
    "/auth/sign-up:sign-up"
    "/legal/terms:terms"
    "/legal/privacy:privacy"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_LIGHTHOUSE=false
SKIP_AXE=false
SKIP_PA11Y=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-lighthouse)
            SKIP_LIGHTHOUSE=true
            shift
            ;;
        --skip-axe)
            SKIP_AXE=true
            shift
            ;;
        --skip-pa11y)
            SKIP_PA11Y=true
            shift
            ;;
        --fix)
            echo -e "${BLUE}Running verification after fixes...${NC}"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Create reports directory
mkdir -p "$REPORTS_DIR"

# Check if dev server is running
check_server() {
    log_info "Checking if dev server is running at $BASE_URL..."
    if curl -s --head "$BASE_URL" | head -n 1 | grep -q "200\|302\|301"; then
        log_success "Dev server is running"
        return 0
    else
        log_error "Dev server is not running at $BASE_URL"
        echo "Please start the dev server with: pnpm dev"
        exit 1
    fi
}

# Run Lighthouse audits
run_lighthouse() {
    if [ "$SKIP_LIGHTHOUSE" = true ]; then
        log_warning "Skipping Lighthouse audits"
        return
    fi

    log_info "Running Lighthouse accessibility audits..."

    for page_info in "${PAGES[@]}"; do
        IFS=':' read -r path name <<< "$page_info"
        url="${BASE_URL}${path}"
        output_path="${REPORTS_DIR}/lighthouse-${name}"

        log_info "Auditing ${name} (${url})..."

        if npx lighthouse "$url" \
            --only-categories=accessibility \
            --output=json \
            --output=html \
            --output-path="$output_path" \
            --chrome-flags="--headless --no-sandbox --disable-gpu" \
            --quiet 2>/dev/null; then

            # Extract score from JSON
            if [ -f "${output_path}.json" ]; then
                score=$(jq '.categories.accessibility.score * 100' "${output_path}.json" 2>/dev/null || echo "N/A")
                if [ "$score" != "N/A" ] && [ $(echo "$score >= 90" | bc -l) -eq 1 ]; then
                    log_success "${name}: ${score}/100"
                elif [ "$score" != "N/A" ] && [ $(echo "$score >= 70" | bc -l) -eq 1 ]; then
                    log_warning "${name}: ${score}/100 (needs improvement)"
                else
                    log_error "${name}: ${score}/100 (critical issues)"
                fi
            fi
        else
            log_error "Failed to audit ${name}"
        fi
    done
}

# Run axe-core Playwright tests
run_axe() {
    if [ "$SKIP_AXE" = true ]; then
        log_warning "Skipping axe-core tests"
        return
    fi

    log_info "Running axe-core Playwright tests..."

    # Run Playwright accessibility tests
    npx playwright test tests/accessibility/ --reporter=json --output="${REPORTS_DIR}/axe-results.json" 2>&1 | tee "${REPORTS_DIR}/axe-output.log"

    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        log_success "All axe-core tests passed"
    else
        log_error "axe-core tests found violations"
    fi
}

# Run pa11y checks
run_pa11y() {
    if [ "$SKIP_PA11Y" = true ]; then
        log_warning "Skipping pa11y checks"
        return
    fi

    log_info "Running pa11y accessibility checks..."

    for page_info in "${PAGES[@]}"; do
        IFS=':' read -r path name <<< "$page_info"
        url="${BASE_URL}${path}"
        output_path="${REPORTS_DIR}/pa11y-${name}.json"

        log_info "Checking ${name} (${url})..."

        if npx pa11y "$url" \
            --standard WCAG2AA \
            --reporter json \
            --ignore "warning" \
            > "$output_path" 2>/dev/null; then

            # Count issues
            issues=$(jq 'length' "$output_path" 2>/dev/null || echo "0")
            if [ "$issues" = "0" ] || [ "$issues" = "null" ]; then
                log_success "${name}: No issues found"
            else
                log_error "${name}: ${issues} issues found"
            fi
        else
            # pa11y returns non-zero if issues found
            issues=$(jq 'length' "$output_path" 2>/dev/null || echo "unknown")
            if [ "$issues" != "unknown" ] && [ "$issues" != "null" ] && [ "$issues" -gt 0 ]; then
                log_error "${name}: ${issues} issues found"
            else
                log_warning "${name}: Could not complete check"
            fi
        fi
    done
}

# Generate summary report
generate_summary() {
    log_info "Generating summary report..."

    summary_file="${REPORTS_DIR}/wcag-audit-summary.md"

    cat > "$summary_file" << EOF
# WCAG 2.1 AA Accessibility Audit Summary

**Generated:** $(date)
**Base URL:** $BASE_URL

## Lighthouse Accessibility Scores

| Page | Score | Status |
|------|-------|--------|
EOF

    # Add Lighthouse scores
    for page_info in "${PAGES[@]}"; do
        IFS=':' read -r path name <<< "$page_info"
        json_file="${REPORTS_DIR}/lighthouse-${name}.json"

        if [ -f "$json_file" ]; then
            score=$(jq '.categories.accessibility.score * 100' "$json_file" 2>/dev/null || echo "N/A")
            if [ "$score" != "N/A" ] && [ "$score" != "null" ]; then
                score_int=${score%.*}
                if [ "$score_int" -ge 90 ]; then
                    status="Pass"
                elif [ "$score_int" -ge 70 ]; then
                    status="Needs Improvement"
                else
                    status="Critical"
                fi
                echo "| ${name} | ${score}/100 | ${status} |" >> "$summary_file"
            else
                echo "| ${name} | N/A | Not Run |" >> "$summary_file"
            fi
        else
            echo "| ${name} | N/A | Not Run |" >> "$summary_file"
        fi
    done

    cat >> "$summary_file" << EOF

## axe-core Violations

EOF

    # Check axe results
    axe_log="${REPORTS_DIR}/axe-output.log"
    if [ -f "$axe_log" ]; then
        if grep -q "passed" "$axe_log" 2>/dev/null; then
            echo "All pages passed axe-core WCAG 2.1 AA checks." >> "$summary_file"
        else
            echo "See \`${REPORTS_DIR}/axe-output.log\` for details." >> "$summary_file"
            grep -E "(violation|error|failed)" "$axe_log" 2>/dev/null >> "$summary_file" || true
        fi
    else
        echo "axe-core tests not run." >> "$summary_file"
    fi

    cat >> "$summary_file" << EOF

## pa11y Issues

| Page | Issues | Severity |
|------|--------|----------|
EOF

    # Add pa11y results
    for page_info in "${PAGES[@]}"; do
        IFS=':' read -r path name <<< "$page_info"
        json_file="${REPORTS_DIR}/pa11y-${name}.json"

        if [ -f "$json_file" ]; then
            issues=$(jq 'length' "$json_file" 2>/dev/null || echo "0")
            if [ "$issues" = "null" ]; then
                issues="0"
            fi

            if [ "$issues" -eq 0 ]; then
                severity="None"
            elif [ "$issues" -lt 5 ]; then
                severity="Minor"
            elif [ "$issues" -lt 10 ]; then
                severity="Moderate"
            else
                severity="Critical"
            fi

            echo "| ${name} | ${issues} | ${severity} |" >> "$summary_file"
        else
            echo "| ${name} | N/A | Not Run |" >> "$summary_file"
        fi
    done

    cat >> "$summary_file" << EOF

## Common Issues to Fix

Based on typical accessibility issues:

1. **Missing alt text on images** - Add descriptive alt attributes
2. **Insufficient color contrast** - Ensure 4.5:1 ratio for normal text, 3:1 for large text
3. **Missing form labels** - Associate labels with form inputs using \`for\` attribute
4. **Missing skip navigation links** - Add "Skip to main content" link
5. **Incorrect heading hierarchy** - Use h1 > h2 > h3 sequentially

## Target Compliance

- **Lighthouse Score:** >= 90 on all pages
- **axe-core:** Zero critical/serious WCAG 2.1 AA violations
- **pa11y:** Zero errors

## Files Generated

- Lighthouse HTML reports: \`reports/lighthouse-*.html\`
- Lighthouse JSON data: \`reports/lighthouse-*.json\`
- pa11y JSON data: \`reports/pa11y-*.json\`
- axe-core output: \`reports/axe-output.log\`

EOF

    log_success "Summary report generated: ${summary_file}"
}

# Main execution
main() {
    echo ""
    echo "=============================================="
    echo "  LXP360-SaaS WCAG 2.1 AA Accessibility Audit"
    echo "=============================================="
    echo ""

    check_server
    echo ""

    run_lighthouse
    echo ""

    run_axe
    echo ""

    run_pa11y
    echo ""

    generate_summary

    echo ""
    echo "=============================================="
    echo "  Audit Complete"
    echo "=============================================="
    echo ""
    echo "Review the summary at: ${REPORTS_DIR}/wcag-audit-summary.md"
    echo "Review detailed reports in: ${REPORTS_DIR}/"
    echo ""
}

main "$@"
