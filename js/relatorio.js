class Relatorio {
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
        this.modalRelatorio = document.getElementById('modal-relatorio');
        this.modalOverlayRelatorio = document.getElementById('modal-overlay-relatorio');
        this.filtroPaciente = document.getElementById('filtro-paciente');
        this.listaPacientesFiltro = document.getElementById('lista-pacientes-filtro');
        this.dadosRelatorio = document.getElementById('dados-relatorio');
        this.infoPaciente = document.getElementById('info-paciente');
        this.infoResponsavel = document.getElementById('info-responsavel');
        this.infoHistorico = document.getElementById('info-historico');
        this.infoFinanceiro = document.getElementById('info-financeiro');
        this.historicoConsultas = document.getElementById('historico-consultas');
        this.btnGerarPDF = document.getElementById('gerar-pdf');
        this.checkboxesFiltro = document.querySelectorAll('input[name="filtro-info"]');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Filtrar pacientes ao digitar
        if (this.filtroPaciente) {
            this.filtroPaciente.addEventListener('input', () => this.filtrarPacientes());
        }

        // Controlar a exibição das seções com base nos checkboxes
        this.checkboxesFiltro.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.atualizarSecoesPaciente());
        });

        // Adicionar evento para gerar PDF
        if (this.btnGerarPDF) {
            this.btnGerarPDF.addEventListener('click', () => this.gerarPDF());
        }
    }

    filtrarPacientes() {
        const termo = this.filtroPaciente.value.toLowerCase();
        
        if (termo.length < 2) {
            this.listaPacientesFiltro.classList.add('hidden');
            return;
        }
        
        // Carregar pacientes do localStorage
        const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
        
        // Filtrar pacientes pelo nome
        const pacientesFiltrados = pacientes.filter(p => 
            p.nome.toLowerCase().includes(termo)
        );
        
        // Exibir resultados
        this.listaPacientesFiltro.innerHTML = '';
        
        if (pacientesFiltrados.length === 0) {
            const item = document.createElement('div');
            item.className = 'item-paciente';
            item.textContent = 'Nenhum paciente encontrado';
            this.listaPacientesFiltro.appendChild(item);
        } else {
            pacientesFiltrados.forEach(p => {
                const item = document.createElement('div');
                item.className = 'item-paciente';
                item.textContent = p.nome;
                item.addEventListener('click', () => this.selecionarPaciente(p));
                this.listaPacientesFiltro.appendChild(item);
            });
        }
        
        this.listaPacientesFiltro.classList.remove('hidden');
    }

    selecionarPaciente(paciente) {
        // Preencher o campo de filtro com o nome do paciente
        this.filtroPaciente.value = paciente.nome;
        this.listaPacientesFiltro.classList.add('hidden');
        
        // Exibir informações do paciente
        this.infoPaciente.innerHTML = `
            <p><strong>Nome:</strong> ${paciente.nome}</p>
            <p><strong>Data de Nascimento:</strong> ${this.formatarData(paciente.data_nascimento)}</p>
            <p><strong>Idade:</strong> ${paciente.idade} anos</p>
            <p><strong>Telefone:</strong> ${paciente.telefone}</p>
            <p><strong>E-mail:</strong> ${paciente.email}</p>
            <p><strong>Endereço:</strong> ${this.formatarEndereco(paciente)}</p>
        `;
        
        // Exibir informações do responsável
        if (paciente.nome_responsavel) {
            this.infoResponsavel.innerHTML = `
                <p><strong>Nome do Responsável:</strong> ${paciente.nome_responsavel}</p>
                <p><strong>Parentesco:</strong> ${paciente.parentesco || 'Não informado'}</p>
                <p><strong>Telefone do Responsável:</strong> ${paciente.telefone_responsavel || 'Não informado'}</p>
                <p><strong>Observações:</strong> ${paciente.observacoes || 'Nenhuma observação'}</p>
            `;
        } else {
            this.infoResponsavel.innerHTML = '<p>Não há informações de responsável cadastradas.</p>';
        }
        
        // Exibir histórico
        this.infoHistorico.innerHTML = `
            <p><strong>Doenças Prévias:</strong> ${paciente.doencas_previas || 'Nenhuma'}</p>
            <p><strong>Medicamentos em Uso:</strong> ${paciente.medicamentos || 'Nenhum'}</p>
            <p><strong>Alergias:</strong> ${paciente.alergias || 'Nenhuma'}</p>
            <p><strong>Cirurgias Anteriores:</strong> ${paciente.cirurgias || 'Nenhuma'}</p>
            <p><strong>Histórico Familiar:</strong> ${paciente.historico_familiar || 'Nenhum'}</p>
        `;
        
        // Exibir informações financeiras
        const convenio = paciente.convenio || 'NÃO';
        this.infoFinanceiro.innerHTML = `
            <p><strong>Convênio:</strong> ${convenio}</p>
            ${convenio === 'SIM' ? `
                <p><strong>Nome do Convênio:</strong> ${paciente.nome_convenio || 'Não informado'}</p>
                <p><strong>Operadora:</strong> ${paciente.operadora_convenio || 'Não informado'}</p>
            ` : ''}
            <p><strong>Valor da Consulta:</strong> R$ ${paciente.valor_consulta || '0,00'}</p>
            <p><strong>Período de Atendimento:</strong> ${paciente.periodo_atendimento || 'Não informado'}</p>
            ${paciente.periodo_atendimento === 'Determinado' ? `
                <p><strong>Quantidade de Atendimentos:</strong> ${paciente.quantidade_dias}</p>
            ` : ''}
        `;
        
        // Carregar e exibir consultas do paciente
        const consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
        const consultasPaciente = consultas.filter(c => c.paciente === paciente.nome);
        
        if (consultasPaciente.length === 0) {
            this.historicoConsultas.innerHTML = '<p>Nenhuma consulta registrada para este paciente.</p>';
        } else {
            this.historicoConsultas.innerHTML = consultasPaciente
                .sort((a, b) => new Date(b.data) - new Date(a.data))
                .map(c => `
                    <div class="consulta-item">
                        <div class="consulta-data">${this.formatarData(c.data)}</div>
                        <div class="consulta-horario">${c.horario_inicio} - ${c.horario_fim}</div>
                        ${c.observacoes ? `<div class="consulta-obs">${c.observacoes}</div>` : ''}
                    </div>
                `).join('');
        }
        
        // Mostrar o container de dados
        this.dadosRelatorio.classList.remove('hidden');
        
        // Atualizar visibilidade das seções
        this.atualizarSecoesPaciente();
    }

    atualizarSecoesPaciente() {
        // Obter os valores dos checkboxes selecionados
        const secoesSelecionadas = Array.from(this.checkboxesFiltro)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        // Atualizar a visibilidade das seções
        document.getElementById('secao-dados-paciente').classList.toggle('hidden', !secoesSelecionadas.includes('dados-paciente'));
        document.getElementById('secao-dados-responsavel').classList.toggle('hidden', !secoesSelecionadas.includes('dados-responsavel'));
        document.getElementById('secao-historico').classList.toggle('hidden', !secoesSelecionadas.includes('historico'));
        document.getElementById('secao-financeiro').classList.toggle('hidden', !secoesSelecionadas.includes('financeiro'));
        document.getElementById('secao-consultas').classList.toggle('hidden', !secoesSelecionadas.includes('consultas'));
    }

    formatarData(data) {
        if (!data) return 'Não informado';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    formatarEndereco(paciente) {
        if (!paciente.logradouro) return 'Não informado';
        
        return `${paciente.logradouro}, ${paciente.numero}${paciente.complemento ? ', ' + paciente.complemento : ''} - ${paciente.bairro}, ${paciente.cidade}/${paciente.uf}`;
    }

    async gerarPDF() {
        // Verificar se há dados para gerar o PDF
        if (this.dadosRelatorio.classList.contains('hidden')) {
            alert('Por favor, selecione um paciente antes de gerar o PDF.');
            return;
        }

        // Criar um clone do elemento para não afetar a visualização atual
        const conteudo = this.dadosRelatorio.cloneNode(true);

        // Remover seções ocultas do clone
        Array.from(conteudo.getElementsByClassName('hidden')).forEach(el => el.remove());

        // Configurações do PDF
        const opt = {
            margin: [10, 10],
            filename: `relatorio_${this.filtroPaciente.value.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            // Adicionar classe temporária para estilização do PDF
            conteudo.classList.add('pdf-content');
            
            // Gerar o PDF
            await html2pdf().set(opt).from(conteudo).save();
            
            alert('PDF gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        }
    }
}

// Criar instância da classe quando o documento estiver pronto
const relatorio = new Relatorio(); 