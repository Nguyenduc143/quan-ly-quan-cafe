(function() {
    'use strict';

    angular.module('coffeeShopApp')
        .service('NotificationService', NotificationService);

    NotificationService.$inject = ['$timeout'];

    function NotificationService($timeout) {
        var notifications = [];
        
        var service = {
            success: success,
            error: error,
            warning: warning,
            info: info
        };

        return service;

        // ==================== FUNCTIONS ====================

        /**
         * Show success notification
         */
        function success(message, duration) {
            show(message, 'success', duration);
        }

        /**
         * Show error notification
         */
        function error(message, duration) {
            show(message, 'error', duration);
        }

        /**
         * Show warning notification
         */
        function warning(message, duration) {
            show(message, 'warning', duration);
        }

        /**
         * Show info notification
         */
        function info(message, duration) {
            show(message, 'info', duration);
        }

        /**
         * Show notification
         */
        function show(message, type, duration) {
            duration = duration || 3000;

            // Calculate top position based on existing notifications
            var topPosition = 20;
            notifications.forEach(function(n) {
                if (n.element && n.element.parentNode) {
                    topPosition += n.element.offsetHeight + 10;
                }
            });

            // Create notification element
            var notification = document.createElement('div');
            notification.className = 'toast-notification toast-' + type;
            notification.textContent = message;
            
            // Add styles
            notification.style.cssText = `
                position: fixed;
                top: ${topPosition}px;
                right: 20px;
                padding: 16px 24px;
                background: ${getBackgroundColor(type)};
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 999999;
                font-size: 14px;
                font-weight: 500;
                min-width: 250px;
                max-width: 400px;
                opacity: 0;
                transform: translateX(400px);
                transition: all 0.3s ease;
                cursor: pointer;
            `;

            // Store notification
            var notificationObj = { element: notification };
            notifications.push(notificationObj);

            // Append to body
            document.body.appendChild(notification);

            // Trigger animation
            $timeout(function() {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 10);

            // Remove after duration
            var removeTimeout = $timeout(function() {
                removeNotification(notification, notificationObj);
            }, duration);

            // Click to dismiss
            notification.addEventListener('click', function() {
                $timeout.cancel(removeTimeout);
                removeNotification(notification, notificationObj);
            });
        }

        /**
         * Remove notification and reposition others
         */
        function removeNotification(element, notificationObj) {
            element.style.opacity = '0';
            element.style.transform = 'translateX(400px)';
            
            $timeout(function() {
                if (element.parentNode) {
                    document.body.removeChild(element);
                }
                
                // Remove from array
                var index = notifications.indexOf(notificationObj);
                if (index > -1) {
                    notifications.splice(index, 1);
                }
                
                // Reposition remaining notifications
                repositionNotifications();
            }, 300);
        }

        /**
         * Reposition all notifications after one is removed
         */
        function repositionNotifications() {
            var topPosition = 20;
            notifications.forEach(function(n) {
                if (n.element && n.element.parentNode) {
                    n.element.style.top = topPosition + 'px';
                    topPosition += n.element.offsetHeight + 10;
                }
            });
        }

        /**
         * Get background color based on type
         */
        function getBackgroundColor(type) {
            var colors = {
                'success': '#10b981',
                'error': '#ef4444',
                'warning': '#f59e0b',
                'info': '#3b82f6'
            };
            return colors[type] || colors['info'];
        }
    }

})();
