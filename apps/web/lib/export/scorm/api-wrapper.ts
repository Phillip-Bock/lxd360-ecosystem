import type { SCORMVersion } from '../types';

// ============================================================================
// API WRAPPER GENERATOR
// ============================================================================

/**
 * Generate JavaScript code for SCORM API wrapper
 *
 * @param scormVersion - Target SCORM version
 * @returns JavaScript code string
 */
export function generateAPIWrapper(scormVersion: SCORMVersion): string {
  const is2004 = scormVersion.startsWith('2004');

  return `
/**
 * LXP360 SCORM API Wrapper
 * Version: 1.0.0
 * SCORM: ${scormVersion}
 */
var LXP360_SCORM = (function() {
  'use strict';

  // Private variables
  var _api = null;
  var _initialized = false;
  var _terminated = false;
  var _lastError = '0';
  var _version = '${scormVersion}';
  var _is2004 = ${is2004};

  // Error codes
  var ERROR_CODES = {
    NO_ERROR: '0',
    GENERAL_ERROR: '101',
    INVALID_ARGUMENT: '201',
    NOT_INITIALIZED: '301',
    ALREADY_INITIALIZED: '302',
    TERMINATED: '401',
    BEFORE_INIT: '401',
    AFTER_TERMINATE: '402'
  };

  /**
   * Find the SCORM API in parent windows
   * @param {Window} win - Starting window
   * @returns {Object|null} - SCORM API object or null
   */
  function findAPI(win) {
    var attempts = 0;
    var maxAttempts = 500;
    var apiName = _is2004 ? 'API_1484_11' : 'API';

    // Check opener first
    if (win.opener && typeof win.opener !== 'undefined') {
      var openerAPI = scanForAPI(win.opener, apiName, maxAttempts);
      if (openerAPI) return openerAPI;
    }

    // Then check parent chain
    return scanForAPI(win, apiName, maxAttempts);
  }

  /**
   * Scan window hierarchy for API
   */
  function scanForAPI(win, apiName, maxAttempts) {
    var attempts = 0;

    while (win && attempts < maxAttempts) {
      attempts++;

      try {
        if (win[apiName]) {
          return win[apiName];
        }

        // Check for API in named window
        if (win.document && win.document[apiName]) {
          return win.document[apiName];
        }
      } catch (e) {
        // Cross-origin access denied
      }

      // Move to parent
      if (win.parent && win.parent !== win) {
        win = win.parent;
      } else {
        break;
      }
    }

    return null;
  }

  /**
   * Initialize SCORM communication
   * @returns {boolean} - Success status
   */
  function initialize() {
    if (_initialized) {
      _lastError = ERROR_CODES.ALREADY_INITIALIZED;
      return false;
    }

    if (_terminated) {
      _lastError = ERROR_CODES.AFTER_TERMINATE;
      return false;
    }

    if (!_api) {
      _api = findAPI(window);
    }

    if (!_api) {
      _lastError = ERROR_CODES.GENERAL_ERROR;
      return false;
    }

    var result;
    if (_is2004) {
      result = _api.Initialize('');
    } else {
      result = _api.LMSInitialize('');
    }

    if (result === 'true' || result === true) {
      _initialized = true;
      _lastError = ERROR_CODES.NO_ERROR;
      return true;
    }

    _lastError = getAPIError();
    return false;
  }

  /**
   * Terminate SCORM communication
   * @returns {boolean} - Success status
   */
  function terminate() {
    if (!_initialized) {
      _lastError = ERROR_CODES.NOT_INITIALIZED;
      return false;
    }

    if (_terminated) {
      _lastError = ERROR_CODES.AFTER_TERMINATE;
      return false;
    }

    // Commit unknown pending data first
    commit();

    var result;
    if (_is2004) {
      result = _api.Terminate('');
    } else {
      result = _api.LMSFinish('');
    }

    if (result === 'true' || result === true) {
      _terminated = true;
      _lastError = ERROR_CODES.NO_ERROR;
      return true;
    }

    _lastError = getAPIError();
    return false;
  }

  /**
   * Get a value from the LMS
   * @param {string} element - Data model element
   * @returns {string} - Value or empty string
   */
  function getValue(element) {
    if (!_initialized) {
      _lastError = ERROR_CODES.NOT_INITIALIZED;
      return '';
    }

    if (_terminated) {
      _lastError = ERROR_CODES.AFTER_TERMINATE;
      return '';
    }

    var result;
    if (_is2004) {
      result = _api.GetValue(element);
    } else {
      result = _api.LMSGetValue(element);
    }

    _lastError = getAPIError();
    return result || '';
  }

  /**
   * Set a value in the LMS
   * @param {string} element - Data model element
   * @param {string} value - Value to set
   * @returns {boolean} - Success status
   */
  function setValue(element, value) {
    if (!_initialized) {
      _lastError = ERROR_CODES.NOT_INITIALIZED;
      return false;
    }

    if (_terminated) {
      _lastError = ERROR_CODES.AFTER_TERMINATE;
      return false;
    }

    var result;
    if (_is2004) {
      result = _api.SetValue(element, String(value));
    } else {
      result = _api.LMSSetValue(element, String(value));
    }

    if (result === 'true' || result === true) {
      _lastError = ERROR_CODES.NO_ERROR;
      return true;
    }

    _lastError = getAPIError();
    return false;
  }

  /**
   * Commit data to the LMS
   * @returns {boolean} - Success status
   */
  function commit() {
    if (!_initialized) {
      _lastError = ERROR_CODES.NOT_INITIALIZED;
      return false;
    }

    if (_terminated) {
      _lastError = ERROR_CODES.AFTER_TERMINATE;
      return false;
    }

    var result;
    if (_is2004) {
      result = _api.Commit('');
    } else {
      result = _api.LMSCommit('');
    }

    if (result === 'true' || result === true) {
      _lastError = ERROR_CODES.NO_ERROR;
      return true;
    }

    _lastError = getAPIError();
    return false;
  }

  /**
   * Get last error code
   * @returns {string} - Error code
   */
  function getLastError() {
    return _lastError;
  }

  /**
   * Get error from API
   */
  function getAPIError() {
    if (!_api) return ERROR_CODES.GENERAL_ERROR;

    try {
      if (_is2004) {
        return _api.GetLastError() || ERROR_CODES.NO_ERROR;
      } else {
        return _api.LMSGetLastError() || ERROR_CODES.NO_ERROR;
      }
    } catch (e) {
      return ERROR_CODES.GENERAL_ERROR;
    }
  }

  /**
   * Get error string
   * @param {string} errorCode - Error code
   * @returns {string} - Error description
   */
  function getErrorString(errorCode) {
    if (!_api) return 'No API connection';

    try {
      if (_is2004) {
        return _api.GetErrorString(errorCode);
      } else {
        return _api.LMSGetErrorString(errorCode);
      }
    } catch (e) {
      return 'Unknown error';
    }
  }

  /**
   * Get diagnostic info
   * @param {string} errorCode - Error code
   * @returns {string} - Diagnostic information
   */
  function getDiagnostic(errorCode) {
    if (!_api) return 'No API connection';

    try {
      if (_is2004) {
        return _api.GetDiagnostic(errorCode);
      } else {
        return _api.LMSGetDiagnostic(errorCode);
      }
    } catch (e) {
      return '';
    }
  }

  // ========================================
  // Convenience methods
  // ========================================

  /**
   * Set lesson status (completion)
   * @param {string} status - 'completed', 'incomplete', 'passed', 'failed', etc.
   */
  function setStatus(status) {
    if (_is2004) {
      // SCORM 2004 separates completion and success
      if (status === 'passed' || status === 'failed') {
        setValue('cmi.success_status', status);
        setValue('cmi.completion_status', 'completed');
      } else if (status === 'completed' || status === 'incomplete') {
        setValue('cmi.completion_status', status);
      }
    } else {
      // SCORM 1.2 uses combined status
      setValue('cmi.core.lesson_status', status);
    }
    commit();
  }

  /**
   * Set score
   * @param {number} score - Score value (0-100)
   */
  function setScore(score) {
    var scaled = score / 100;

    if (_is2004) {
      setValue('cmi.score.raw', String(score));
      setValue('cmi.score.scaled', String(scaled.toFixed(2)));
    } else {
      setValue('cmi.core.score.raw', String(score));
    }
    commit();
  }

  /**
   * Set session time
   * @param {number} seconds - Time in seconds
   */
  function setSessionTime(seconds) {
    var timeString;

    if (_is2004) {
      // ISO 8601 duration format
      var hours = Math.floor(seconds / 3600);
      var minutes = Math.floor((seconds % 3600) / 60);
      var secs = Math.floor(seconds % 60);
      timeString = 'PT' + hours + 'H' + minutes + 'M' + secs + 'S';
      setValue('cmi.session_time', timeString);
    } else {
      // SCORM 1.2 format: HHHH:MM:SS.SS
      var hours = Math.floor(seconds / 3600);
      var minutes = Math.floor((seconds % 3600) / 60);
      var secs = Math.floor(seconds % 60);
      timeString = padZero(hours, 4) + ':' + padZero(minutes, 2) + ':' + padZero(secs, 2);
      setValue('cmi.core.session_time', timeString);
    }
    commit();
  }

  function padZero(num, length) {
    var str = String(num);
    while (str.length < length) str = '0' + str;
    return str;
  }

  /**
   * Set suspend data (bookmarking)
   * @param {string} data - Data to save
   */
  function setSuspendData(data) {
    if (_is2004) {
      setValue('cmi.suspend_data', data);
    } else {
      setValue('cmi.suspend_data', data);
    }
    commit();
  }

  /**
   * Get suspend data
   * @returns {string} - Saved data
   */
  function getSuspendData() {
    if (_is2004) {
      return getValue('cmi.suspend_data');
    } else {
      return getValue('cmi.suspend_data');
    }
  }

  /**
   * Set bookmark location
   * @param {string} location - Location identifier
   */
  function setLocation(location) {
    if (_is2004) {
      setValue('cmi.location', location);
    } else {
      setValue('cmi.core.lesson_location', location);
    }
    commit();
  }

  /**
   * Get bookmark location
   * @returns {string} - Location identifier
   */
  function getLocation() {
    if (_is2004) {
      return getValue('cmi.location');
    } else {
      return getValue('cmi.core.lesson_location');
    }
  }

  /**
   * Check if API is available
   * @returns {boolean}
   */
  function isAvailable() {
    return _api !== null;
  }

  /**
   * Check if initialized
   * @returns {boolean}
   */
  function isInitialized() {
    return _initialized;
  }

  // Public API
  return {
    findAPI: findAPI,
    initialize: initialize,
    terminate: terminate,
    getValue: getValue,
    setValue: setValue,
    commit: commit,
    getLastError: getLastError,
    getErrorString: getErrorString,
    getDiagnostic: getDiagnostic,

    // Convenience methods
    setStatus: setStatus,
    setScore: setScore,
    setSessionTime: setSessionTime,
    setSuspendData: setSuspendData,
    getSuspendData: getSuspendData,
    setLocation: setLocation,
    getLocation: getLocation,
    isAvailable: isAvailable,
    isInitialized: isInitialized,

    // Version info
    version: '${scormVersion}'
  };
})();
`;
}

/**
 * Generate standalone SCORM API detection script
 */
export function generateAPIDetectionScript(): string {
  return `
/**
 * SCORM API Detection
 * Detects whether SCORM 1.2 or 2004 API is available
 */
function detectSCORMAPI(win) {
  var attempts = 0;
  var maxAttempts = 500;

  function scan(w) {
    while (w && attempts < maxAttempts) {
      attempts++;
      try {
        if (w.API_1484_11) return { api: w.API_1484_11, version: '2004' };
        if (w.API) return { api: w.API, version: '1.2' };
      } catch (e) {}
      if (w.parent && w.parent !== w) {
        w = w.parent;
      } else {
        break;
      }
    }
    return null;
  }

  // Check opener first
  if (win.opener) {
    var result = scan(win.opener);
    if (result) return result;
  }

  return scan(win);
}
`;
}
