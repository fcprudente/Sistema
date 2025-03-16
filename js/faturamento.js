// Gerenciamento de Faturamento
class Faturamento {
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
        // Obter elementos do DOM
        this.btnFaturamento = document.getElementById('faturamento');
        this.modalFaturamento = document.getElementById('modal-faturamento');
        this.modalOverlay = document.getElementById('modal-overlay');
        this.dataInicioFaturamento = document.getElementById('data-inicio-faturamento');
        this.dataFimFaturamento = document.getElementById('data-fim-faturamento');
        this.btnGerarFaturamento = document.getElementById('gerar-faturamento');
        this.btnExportarExcel = document.getElementById('exportar-excel');
        this.btnFecharFaturamento = this.modalFaturamento.querySelector('.fechar-modal');
        this.resultadoFaturamento = document.getElementById('resultado-faturamento');
        
        // Verificar se todos os elementos necessários foram encontrados
        if (!this.btnFaturamento || !this.modalFaturamento || !this.modalOverlay) {
            console.error('Elementos essenciais de faturamento não encontrados:', {
                btnFaturamento: !!this.btnFaturamento,
                modalFaturamento: !!this.modalFaturamento,
                modalOverlay: !!this.modalOverlay
            });
            return;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Configurar evento do botão de faturamento
        this.btnFaturamento.addEventListener('click', () => {
            console.log('Botão de faturamento clicado');
            this.abrirModalFaturamento();
        });

        // Configurar fechamento do modal
        this.btnFecharFaturamento.addEventListener('click', () => this.fecharModalFaturamento());
        this.modalOverlay.addEventListener('click', () => this.fecharModalFaturamento());

        // Evitar que cliques dentro do modal fechem ele
        this.modalFaturamento.addEventListener('click', (e) => e.stopPropagation());

        // Configurar validação de datas
        if (this.dataInicioFaturamento && this.dataFimFaturamento) {
            this.dataInicioFaturamento.addEventListener('change', () => this.validarDataInicial());
            this.dataFimFaturamento.addEventListener('change', () => this.validarDataFinal());
        }

        // Configurar botão de gerar faturamento
        if (this.btnGerarFaturamento) {
            this.btnGerarFaturamento.addEventListener('click', () => this.gerarFaturamento());
        }

        // Configurar botão de exportar para Excel
        if (this.btnExportarExcel) {
            this.btnExportarExcel.addEventListener('click', () => this.exportarParaExcel());
        }
    }

    abrirModalFaturamento() {
        console.log('Abrindo modal de faturamento');
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        if (this.dataInicioFaturamento && this.dataFimFaturamento) {
            this.dataInicioFaturamento.value = primeiroDiaMes.toISOString().split('T')[0];
            this.dataFimFaturamento.value = ultimoDiaMes.toISOString().split('T')[0];
        }

        this.modalFaturamento.classList.remove('hidden');
        this.modalOverlay.classList.remove('hidden');
    }

    fecharModalFaturamento() {
        console.log('Fechando modal de faturamento');
        this.modalFaturamento.classList.add('hidden');
        this.modalOverlay.classList.add('hidden');
        this.resultadoFaturamento.classList.add('hidden');
        this.dataInicioFaturamento.value = '';
        this.dataFimFaturamento.value = '';
        this.btnExportarExcel.disabled = true;
    }

    validarDataInicial() {
        if (this.dataFimFaturamento.value && this.dataInicioFaturamento.value > this.dataFimFaturamento.value) {
            alert('A data inicial não pode ser maior que a data final');
            this.dataInicioFaturamento.value = this.dataFimFaturamento.value;
        }
    }

    validarDataFinal() {
        if (this.dataInicioFaturamento.value && this.dataFimFaturamento.value < this.dataInicioFaturamento.value) {
            alert('A data final não pode ser menor que a data inicial');
            this.dataFimFaturamento.value = this.dataInicioFaturamento.value;
        }
    }

    gerarFaturamento() {
        const dataInicio = this.dataInicioFaturamento.value;
        const dataFim = this.dataFimFaturamento.value;

        if (!dataInicio || !dataFim) {
            alert('Por favor, selecione o período de apuração.');
            return;
        }

        if (dataInicio > dataFim) {
            alert('A data inicial não pode ser maior que a data final.');
            return;
        }

        const pacientes = JSON.parse(localStorage.getItem('pacientes') || '[]');
        const consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
        const faturamentoPorPaciente = this.calcularFaturamento(pacientes, consultas, dataInicio, dataFim);

        this.exibirResultadoFaturamento(faturamentoPorPaciente);
    }

    calcularFaturamento(pacientes, consultas, dataInicio, dataFim) {
        const faturamento = [];

        pacientes.forEach(paciente => {
            // Filtrar consultas do paciente no período
            const consultasPaciente = consultas.filter(consulta => 
                consulta.paciente === paciente.nome &&
                consulta.data >= dataInicio &&
                consulta.data <= dataFim
            );

            if (consultasPaciente.length > 0) {
                const valorConsulta = parseFloat(paciente.valor_consulta) || 0;
                const valorTotal = valorConsulta * consultasPaciente.length;

                faturamento.push({
                    nome: paciente.nome,
                    qtdAtendimentos: consultasPaciente.length,
                    convenio: paciente.convenio || 'NÃO',
                    operadora: paciente.operadora_convenio || 'N/A',
                    valorConsulta: valorConsulta,
                    valorTotal: valorTotal
                });
            }
        });

        return faturamento;
    }

    exibirResultadoFaturamento(faturamento) {
        if (faturamento.length === 0) {
            this.resultadoFaturamento.innerHTML = '<p>Nenhum atendimento encontrado no período selecionado.</p>';
            this.resultadoFaturamento.classList.remove('hidden');
            this.btnExportarExcel.disabled = true;
            return;
        }

        let html = `
            <table class="faturamento-table">
                <thead>
                    <tr>
                        <th>Paciente</th>
                        <th>Qtd. Atendimentos</th>
                        <th>Convênio</th>
                        <th>Operadora</th>
                        <th>Valor Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let valorTotalGeral = 0;

        faturamento.forEach(item => {
            valorTotalGeral += item.valorTotal;
            html += `
                <tr>
                    <td>${item.nome}</td>
                    <td>${item.qtdAtendimentos}</td>
                    <td>${item.convenio}</td>
                    <td>${item.operadora}</td>
                    <td>R$ ${item.valorTotal.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4"><strong>Total Geral</strong></td>
                        <td><strong>R$ ${valorTotalGeral.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        `;

        this.resultadoFaturamento.innerHTML = html;
        this.resultadoFaturamento.classList.remove('hidden');
        this.btnExportarExcel.disabled = false;
        
        // Armazenar os dados do faturamento para exportação
        this.dadosFaturamento = {
            itens: faturamento,
            total: valorTotalGeral
        };
    }

    exportarParaExcel() {
        if (!this.dadosFaturamento) {
            alert('Por favor, gere o faturamento primeiro.');
            return;
        }

        // Criar os dados para o Excel
        const dados = [
            ['Paciente', 'Quantidade de Atendimentos', 'Convênio', 'Operadora', 'Valor Total']
        ];

        // Adicionar dados de cada linha
        this.dadosFaturamento.itens.forEach(item => {
            dados.push([
                item.nome,
                item.qtdAtendimentos,
                item.convenio,
                item.operadora,
                `R$ ${item.valorTotal.toFixed(2)}`
            ]);
        });

        // Adicionar linha em branco e total
        dados.push([]);
        dados.push(['Total Geral', '', '', '', `R$ ${this.dadosFaturamento.total.toFixed(2)}`]);

        // Criar uma nova planilha
        const ws = XLSX.utils.aoa_to_sheet(dados);

        // Definir largura das colunas
        const wscols = [
            {wch: 30}, // Paciente
            {wch: 15}, // Quantidade
            {wch: 15}, // Convênio
            {wch: 20}, // Operadora
            {wch: 15}  // Valor Total
        ];
        ws['!cols'] = wscols;

        // Criar um novo workbook e adicionar a planilha
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Faturamento");

        // Gerar o arquivo Excel
        const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        XLSX.writeFile(wb, `faturamento_${dataAtual}.xls`);
    }
}

// Criar instância da classe quando o documento estiver pronto
const faturamento = new Faturamento(); 