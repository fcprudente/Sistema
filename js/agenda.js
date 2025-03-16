// Gerenciamento da Agenda
class Agenda {
    constructor() {
        this.initialize();
    }

    initialize() {
        // Aguardar o DOM estar completamente carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }

    setupElements() {
        // Elementos do DOM
        this.btnAnteriorMes = document.getElementById('anterior-mes');
        this.btnProximoMes = document.getElementById('proximo-mes');
        this.mesAnoAtual = document.getElementById('mes-ano-atual');
        this.calendario = document.getElementById('calendario');
        this.btnNovaConsulta = document.getElementById('nova-consulta');
        this.modalAgendamento = document.getElementById('modal-agendamento');
        this.modalOverlay = document.getElementById('modal-overlay');
        this.dataConsultaInput = document.getElementById('data-consulta');
        this.horarioInicioInput = document.getElementById('horario-inicio');
        this.horarioFimInput = document.getElementById('horario-fim');
        this.pacienteConsultaSelect = document.getElementById('paciente-consulta');
        this.observacoesConsultaInput = document.getElementById('observacoes-consulta');
        this.btnSalvarConsulta = document.getElementById('salvar-consulta');
        this.btnExcluirAgendamento = document.getElementById('excluir-agendamento');

        // Data atual para controle do calendário
        this.dataAtual = new Date();
        this.consultas = this.carregarConsultas();

        this.setupEventListeners();
        this.atualizarCalendario();
        this.carregarPacientesSelect();
    }

    setupEventListeners() {
        // Navegação do calendário
        if (this.btnAnteriorMes) {
            this.btnAnteriorMes.addEventListener('click', () => {
                this.dataAtual.setMonth(this.dataAtual.getMonth() - 1);
                this.atualizarCalendario();
            });
        }

        if (this.btnProximoMes) {
            this.btnProximoMes.addEventListener('click', () => {
                this.dataAtual.setMonth(this.dataAtual.getMonth() + 1);
                this.atualizarCalendario();
            });
        }

        // Modal de agendamento
        if (this.btnNovaConsulta) {
            this.btnNovaConsulta.addEventListener('click', () => this.abrirModalAgendamento());
        }

        // Fechar modal
        const botoesFechar = document.querySelectorAll('#modal-agendamento .fechar-modal');
        botoesFechar.forEach(btn => {
            btn.addEventListener('click', () => this.fecharModalAgendamento());
        });

        // Salvar consulta
        if (this.btnSalvarConsulta) {
            this.btnSalvarConsulta.addEventListener('click', () => this.salvarConsulta());
        }

        // Excluir agendamento
        if (this.btnExcluirAgendamento) {
            this.btnExcluirAgendamento.addEventListener('click', () => this.excluirConsulta());
        }

        // Fechar modal ao clicar no overlay
        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', () => this.fecharModalAgendamento());
        }

        // Evitar que cliques dentro do modal fechem ele
        if (this.modalAgendamento) {
            this.modalAgendamento.addEventListener('click', (e) => e.stopPropagation());
        }
    }

    atualizarCalendario() {
        if (!this.calendario || !this.mesAnoAtual) return;

        const mes = this.dataAtual.getMonth();
        const ano = this.dataAtual.getFullYear();
        
        // Atualizar título do mês
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        this.mesAnoAtual.textContent = `${meses[mes]} ${ano}`;

        // Criar cabeçalho do calendário
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        let html = '<div class="calendario-cabecalho">';
        diasSemana.forEach(dia => {
            html += `<div>${dia}</div>`;
        });
        html += '</div><div class="calendario-dias">';

        // Obter o primeiro dia do mês
        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);
        
        // Adicionar dias do mês anterior
        const diasAntes = primeiroDia.getDay();
        const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
        for (let i = diasAntes - 1; i >= 0; i--) {
            html += `<div class="dia outro-mes">${ultimoDiaMesAnterior - i}</div>`;
        }

        // Adicionar dias do mês atual
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const data = new Date(ano, mes, dia);
            const consultasDoDia = this.getConsultasDoDia(data);
            const hoje = new Date();
            const ehHoje = data.toDateString() === hoje.toDateString();
            
            html += `<div class="dia${ehHoje ? ' hoje' : ''}" data-data="${data.toISOString().split('T')[0]}">
                <div class="dia-numero">${dia}</div>
                ${consultasDoDia.map(consulta => `
                    <div class="consulta" data-id="${consulta.id}">
                        ${consulta.horario_inicio} - ${consulta.paciente}
                    </div>
                `).join('')}
            </div>`;
        }

        // Adicionar dias do próximo mês
        const diasDepois = 42 - (diasAntes + ultimoDia.getDate());
        for (let i = 1; i <= diasDepois; i++) {
            html += `<div class="dia outro-mes">${i}</div>`;
        }

        html += '</div>';
        this.calendario.innerHTML = html;

        // Adicionar eventos de clique nas consultas
        const consultasElements = this.calendario.querySelectorAll('.consulta');
        consultasElements.forEach(consulta => {
            consulta.addEventListener('click', (e) => {
                const consultaId = e.target.dataset.id;
                this.editarConsulta(consultaId);
            });
        });
    }

    getConsultasDoDia(data) {
        return this.consultas.filter(consulta => {
            // Converter a data da consulta para o formato local
            const [ano, mes, dia] = consulta.data.split('-');
            const dataConsulta = new Date(ano, mes - 1, dia);
            
            // Converter a data do parâmetro para o mesmo formato
            const dataComparacao = new Date(data.getFullYear(), data.getMonth(), data.getDate());
            
            return dataConsulta.getTime() === dataComparacao.getTime();
        });
    }

    carregarConsultas() {
        return JSON.parse(localStorage.getItem('consultas') || '[]');
    }

    salvarConsultas() {
        localStorage.setItem('consultas', JSON.stringify(this.consultas));
    }

    carregarPacientesSelect() {
        if (!this.pacienteConsultaSelect) return;

        const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
        this.pacienteConsultaSelect.innerHTML = '<option value="">-- Selecione um paciente --</option>' +
            pacientes.map(paciente => `
                <option value="${paciente.nome}">${paciente.nome}</option>
            `).join('');
    }

    abrirModalAgendamento(data = null) {
        if (!this.modalAgendamento || !this.modalOverlay) return;

        if (data) {
            this.dataConsultaInput.value = data;
        }

        this.modalAgendamento.classList.remove('hidden');
        this.modalOverlay.classList.remove('hidden');
        this.btnExcluirAgendamento.classList.add('hidden');
    }

    fecharModalAgendamento() {
        if (!this.modalAgendamento || !this.modalOverlay) return;

        this.modalAgendamento.classList.add('hidden');
        this.modalOverlay.classList.add('hidden');
        this.limparFormularioConsulta();
    }

    limparFormularioConsulta() {
        if (this.dataConsultaInput) this.dataConsultaInput.value = '';
        if (this.horarioInicioInput) this.horarioInicioInput.value = '';
        if (this.horarioFimInput) this.horarioFimInput.value = '';
        if (this.pacienteConsultaSelect) this.pacienteConsultaSelect.value = '';
        if (this.observacoesConsultaInput) this.observacoesConsultaInput.value = '';
    }

    salvarConsulta() {
        if (!this.validarFormularioConsulta()) return;

        console.log('Data selecionada:', this.dataConsultaInput.value);
        
        const consulta = {
            id: Date.now().toString(),
            data: this.dataConsultaInput.value,
            horario_inicio: this.horarioInicioInput.value,
            horario_fim: this.horarioFimInput.value,
            paciente: this.pacienteConsultaSelect.value,
            observacoes: this.observacoesConsultaInput.value
        };

        console.log('Consulta a ser salva:', consulta);
        
        this.consultas.push(consulta);
        this.salvarConsultas();
        this.fecharModalAgendamento();
        this.atualizarCalendario();
    }

    validarFormularioConsulta() {
        if (!this.dataConsultaInput.value) {
            alert('Por favor, selecione uma data para a consulta.');
            return false;
        }
        if (!this.horarioInicioInput.value) {
            alert('Por favor, selecione um horário de início.');
            return false;
        }
        if (!this.horarioFimInput.value) {
            alert('Por favor, selecione um horário de término.');
            return false;
        }
        if (!this.pacienteConsultaSelect.value) {
            alert('Por favor, selecione um paciente.');
            return false;
        }
        return true;
    }

    editarConsulta(consultaId) {
        const consulta = this.consultas.find(c => c.id === consultaId);
        if (!consulta) return;

        this.consultaEditando = consulta;
        this.abrirModalAgendamento();
        
        this.dataConsultaInput.value = consulta.data;
        this.horarioInicioInput.value = consulta.horario_inicio;
        this.horarioFimInput.value = consulta.horario_fim;
        this.pacienteConsultaSelect.value = consulta.paciente;
        this.observacoesConsultaInput.value = consulta.observacoes || '';
        
        this.btnExcluirAgendamento.classList.remove('hidden');
    }

    excluirConsulta() {
        if (!this.consultaEditando || !confirm('Tem certeza que deseja excluir esta consulta?')) return;

        this.consultas = this.consultas.filter(c => c.id !== this.consultaEditando.id);
        this.salvarConsultas();
        this.fecharModalAgendamento();
        this.atualizarCalendario();
    }
}

// Criar instância da classe quando o documento estiver pronto
const agenda = new Agenda(); 