/**
 * @module modules/Announcement.js
 * @name Announcement
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

/**
 * Fetches pending announcements from the server and displays them
 * sequentially in the #lizmap-modal Bootstrap 5 modal.
 */
export default class Announcement {

    init() {
        const announcementUrl = globalThis['lizUrls']?.announcement;
        if (!announcementUrl) {
            return;
        }

        const params = globalThis['lizUrls'].params || {};

        const url = new URL(announcementUrl, window.location.origin);
        if (params.repository) {
            url.searchParams.set('repository', params.repository);
        }
        if (params.project) {
            url.searchParams.set('project', params.project);
        }

        fetch(url.toString())
            .then(response => response.json())
            .then(data => {
                if (data.announcements && data.announcements.length > 0) {
                    this._showAnnouncements(data.announcements);
                }
            })
            .catch(err => {
                console.warn('Failed to fetch announcements:', err);
            });
    }

    /**
     * Show announcements one at a time.
     * @param {Array} announcements
     * @param {number} index
     */
    _showAnnouncements(announcements, index = 0) {
        if (index >= announcements.length) {
            return;
        }

        const announcement = announcements[index];
        this._showModal(announcement, () => {
            this._markSeen(announcement.id);
            // Show next announcement after a short delay
            if (index + 1 < announcements.length) {
                setTimeout(() => {
                    this._showAnnouncements(announcements, index + 1);
                }, 500);
            }
        });
    }

    /**
     * Display a single announcement in the #lizmap-modal.
     * @param {Object} announcement
     * @param {Function} onClose
     */
    _showModal(announcement, onClose) {
        const modalEl = document.getElementById('lizmap-modal');
        if (!modalEl) {
            return;
        }

        modalEl.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${this._escapeHtml(announcement.title)}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${announcement.content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        `;

        const handleHidden = () => {
            modalEl.removeEventListener('hidden.bs.modal', handleHidden);
            if (onClose) {
                onClose();
            }
        };
        modalEl.addEventListener('hidden.bs.modal', handleHidden);

        // Use Bootstrap 5 Modal API if available, fallback to jQuery
        if (globalThis.bootstrap && globalThis.bootstrap.Modal) {
            const modal = new globalThis.bootstrap.Modal(modalEl);
            modal.show();
        } else if (globalThis.jQuery) {
            globalThis.jQuery(modalEl).modal('show');
        }
    }

    /**
     * Tell the server the user has seen this announcement.
     * @param {number} announcementId
     */
    _markSeen(announcementId) {
        const markSeenUrl = globalThis['lizUrls']?.announcementMarkSeen;
        if (!markSeenUrl) {
            // Store in sessionStorage as fallback for anonymous users
            try {
                const key = 'lizmap_announcement_seen';
                const seen = JSON.parse(sessionStorage.getItem(key) || '[]');
                if (!seen.includes(announcementId)) {
                    seen.push(announcementId);
                    sessionStorage.setItem(key, JSON.stringify(seen));
                }
            } catch (e) {
                // sessionStorage not available
            }
            return;
        }

        const url = new URL(markSeenUrl, window.location.origin);
        url.searchParams.set('id', announcementId);

        fetch(url.toString(), { method: 'POST' })
            .catch(err => {
                console.warn('Failed to mark announcement as seen:', err);
            });
    }

    /**
     * Escape HTML special characters for safe text display.
     * @param {string} text
     * @returns {string}
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
