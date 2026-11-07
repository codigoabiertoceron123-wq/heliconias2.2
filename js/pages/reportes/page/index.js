// reportes - index
// Refactor modular: lógica original preservada.

document.addEventListener('DOMContentLoaded', function() {
        // Event listeners para el historial
        const refreshBtn = document.getElementById('refresh-reports');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                if (typeof loadReports === 'function') {
                    loadReports();
                    // Animación de refresco
                    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    setTimeout(() => {
                        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                    }, 1000);
                }
            });
        }
        
        const newReportBtn = document.getElementById('new-report-from-history');
        if (newReportBtn) {
            newReportBtn.addEventListener('click', function() {
                const writeReportBtn = document.getElementById('write-report-btn');
                if (writeReportBtn) {
                    writeReportBtn.click();
                }
            });
        }
        
        const helpHistoryBtn = document.getElementById('help-history');
        if (helpHistoryBtn) {
            helpHistoryBtn.addEventListener('click', function() {
                Swal.fire({
                    title: '<div style="display: flex; align-items: center; gap: 10px; color: #2c3e50;"><i class="fas fa-history" style="color: #2e7d32; font-size: 1.5rem;"></i><span>Guía del Historial de Reportes</span></div>',
                    html: `
                        <div style="text-align: left;">
                            <div style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                                <h4 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-book-open"></i>
                                    Todo lo que necesitas saber sobre el historial
                                </h4>
                            </div>
                            
                            <div style="display: grid; gap: 15px; margin-bottom: 20px;">
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2e7d32;">
                                    <i class="fas fa-filter" style="color: #2e7d32; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Filtrar Reportes</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Usa las pestañas para ver todos, borradores o reportes finalizados</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db;">
                                    <i class="fas fa-search" style="color: #3498db; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Búsqueda Inteligente</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Escribe palabras clave para encontrar reportes específicos rápidamente</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #f39c12;">
                                    <i class="fas fa-eye" style="color: #f39c12; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Vista Rápida</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Haz clic en cualquier reporte para ver una vista previa completa</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #9b59b6;">
                                    <i class="fas fa-edit" style="color: #9b59b6; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Edición Rápida</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Usa los botones de acción para editar, ver o eliminar reportes</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; align-items: start; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e74c3c;">
                                    <i class="fas fa-chart-bar" style="color: #e74c3c; font-size: 1.2rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #2c3e50;">Estadísticas en Tiempo Real</strong>
                                        <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 0.9rem;">Consulta los contadores de reportes por estado y actividad reciente</p>
                                    </div>
                                </div>
                            </div>

                            <div style="background: linear-gradient(135deg, #d4edda, #c3e6cb); padding: 15px; border-radius: 10px; border-left: 4px solid #28a745;">
                                <h5 style="margin: 0 0 10px 0; color: #155724; display: flex; align-items: center; gap: 8px;">
                                    <i class="fas fa-lightbulb"></i>
                                    Tips y Mejores Prácticas
                                </h5>
                                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                    <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #155724; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-star" style="color: #ffc107;"></i>
                                        Usa nombres descriptivos
                                    </span>
                                    <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #155724; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-tags" style="color: #17a2b8;"></i>
                                        Organiza por estado
                                    </span>
                                    <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #155724; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-sync-alt" style="color: #007bff;"></i>
                                        Actualiza frecuentemente
                                    </span>
                                    <span style="background: white; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; color: #155724; display: flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-trash-alt" style="color: #dc3545;"></i>
                                        Limpia borradores viejos
                                    </span>
                                </div>
                            </div>

                            <div style="margin-top: 20px; padding: 12px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
                                <div style="display: flex; align-items: start; gap: 10px;">
                                    <i class="fas fa-exclamation-triangle" style="color: #856404; font-size: 1.1rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong style="color: #856404;">Nota Importante</strong>
                                        <p style="margin: 5px 0 0 0; color: #856404; font-size: 0.9rem;">
                                            Los reportes eliminados no pueden recuperarse. Asegúrate de exportar información importante antes de eliminar.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
                    showCloseButton: true,
                    confirmButtonColor: '#2e7d32',
                    confirmButtonText: '<i class="fas fa-check-circle"></i> ¡Entendido!',
                    width: 650,
                    background: '#ffffff',
                    customClass: {
                        popup: 'history-swal-popup',
                        title: 'history-swal-title',
                        htmlContainer: 'history-swal-html',
                        confirmButton: 'history-swal-confirm-btn'
                    }
                });
            });
        }
        
        // Búsqueda de reportes con debounce para mejor performance
        const searchInput = document.getElementById('search-reports');
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const searchTerm = e.target.value.toLowerCase().trim();
                    const reportItems = document.querySelectorAll('.report-item');
                    let visibleCount = 0;
                    
                    reportItems.forEach(item => {
                        const title = item.querySelector('.report-title h4')?.textContent.toLowerCase() || '';
                        const content = item.querySelector('.report-preview')?.textContent.toLowerCase() || '';
                        const status = item.querySelector('.report-status')?.textContent.toLowerCase() || '';
                        
                        if (title.includes(searchTerm) || content.includes(searchTerm) || status.includes(searchTerm)) {
                            item.style.display = 'flex';
                            item.style.animation = 'fadeIn 0.3s ease-out';
                            visibleCount++;
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    
                    // Mostrar mensaje si no hay resultados
                    const noResultsMsg = document.getElementById('no-results-message');
                    if (visibleCount === 0 && searchTerm !== '') {
                        if (!noResultsMsg) {
                            const resultsContainer = document.querySelector('.reports-list');
                            const message = document.createElement('div');
                            message.id = 'no-results-message';
                            message.className = 'empty-state';
                            message.innerHTML = `
                                <i class="fas fa-search"></i>
                                <h4>Sin resultados</h4>
                                <p>No se encontraron reportes con "${searchTerm}"</p>
                                <button class="btn-small" onclick="document.getElementById('search-reports').value = ''; document.getElementById('search-reports').dispatchEvent(new Event('input'));">
                                    <i class="fas fa-times"></i> Limpiar búsqueda
                                </button>
                            `;
                            resultsContainer.appendChild(message);
                        }
                    } else if (noResultsMsg) {
                        noResultsMsg.remove();
                    }
                    
                    // Actualizar contador de resultados
                    updateSearchResultsCount(visibleCount, reportItems.length);
                    
                }, 300); // 300ms de debounce
            });
        }
        
        // Función para actualizar contador de resultados de búsqueda
        function updateSearchResultsCount(visible, total) {
            const searchCount = document.getElementById('search-results-count');
            const searchTerm = document.getElementById('search-reports').value.trim();
            
            if (searchTerm === '') {
                if (searchCount) searchCount.remove();
                return;
            }
            
            if (!searchCount) {
                const searchBox = document.querySelector('.search-box');
                const countElement = document.createElement('div');
                countElement.id = 'search-results-count';
                countElement.style.cssText = `
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #2e7d32;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 600;
                `;
                searchBox.appendChild(countElement);
            }
            
            document.getElementById('search-results-count').textContent = `${visible}/${total}`;
        }
        
        // Actualizar estadísticas del historial
        function updateHistoryStats(reports) {
            const total = reports.length;
            const recent = reports.filter(report => {
                const reportDate = new Date(report.fecha_modificacion || report.fecha_creacion);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return reportDate >= sevenDaysAgo;
            }).length;
            
            // Actualizar contadores en stats
            const totalElement = document.getElementById('total-reports');
            const recentElement = document.getElementById('recent-reports');
            
            if (totalElement) totalElement.textContent = total;
            if (recentElement) recentElement.textContent = recent;
            
            // Actualizar contadores en tabs
            const allCount = total;
            const borradorCount = reports.filter(r => r.estado === 'borrador').length;
            const finalizadoCount = reports.filter(r => r.estado === 'finalizado').length;
            
            document.getElementById('count-all').textContent = allCount;
            document.getElementById('count-borrador').textContent = borradorCount;
            document.getElementById('count-finalizado').textContent = finalizadoCount;
        }
        
        // Sobrescribir la función loadReports para incluir estadísticas
        const originalLoadReports = window.loadReports;
        if (originalLoadReports) {
            window.loadReports = async function() {
                const reports = await originalLoadReports();
                updateHistoryStats(reports);
                return reports;
            };
        }
        
        // Agregar CSS para animaciones de búsqueda
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(5px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .history-swal-popup {
                border-radius: 15px !important;
                overflow: hidden;
            }
            
            .history-swal-title {
                font-size: 1.5rem !important;
                font-weight: 700 !important;
            }
            
            .history-swal-html {
                max-height: 70vh !important;
                overflow-y: auto !important;
                padding-right: 5px !important;
            }
            
            .history-swal-confirm-btn {
                font-weight: 600 !important;
                padding: 10px 25px !important;
                border-radius: 8px !important;
            }
            
            #no-results-message {
                animation: fadeIn 0.5s ease-out;
            }
            
            #no-results-message i {
                font-size: 2.5rem;
                color: #bdc3c7;
                margin-bottom: 10px;
            }
            
            #no-results-message h4 {
                color: #7f8c8d;
                margin-bottom: 8px;
            }
            
            #no-results-message .btn-small {
                margin-top: 10px;
                background: #f8f9fa;
                color: #6c757d;
                border: 1px solid #dee2e6;
            }
            
            #no-results-message .btn-small:hover {
                background: #e9ecef;
                border-color: #ced4da;
            }
        `;
        document.head.appendChild(style);
        
        // Inicializar estadísticas al cargar la página
        setTimeout(() => {
            if (window.reports && Array.isArray(window.reports)) {
                updateHistoryStats(window.reports);
            }
        }, 1000);
    });
