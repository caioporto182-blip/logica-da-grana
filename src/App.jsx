import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Input } from './components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  Play, 
  Edit, 
  Upload, 
  Filter, 
  Search, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Lightbulb,
  ArrowUpDown,
  CheckCircle,
  Plus,
  FileText,
  Save,
  X,
  Trash2
} from 'lucide-react'
import { timelineAtiva as timelineInicial, bancoIdeias as bancoInicial, getEstatisticas } from './data/cronograma-completo-v3-corrigido'
import './App.css'

function App() {
  // Estados principais
  const [timelineAtiva, setTimelineAtiva] = useState(() => {
    const saved = localStorage.getItem('logica-da-grana-v4-timeline')
    return saved ? JSON.parse(saved) : timelineInicial
  })
  
  const [bancoIdeias, setBancoIdeias] = useState(() => {
    const saved = localStorage.getItem('logica-da-grana-v4-banco')
    return saved ? JSON.parse(saved) : bancoInicial
  })
  
  const [historicoPostagens, setHistoricoPostagens] = useState(() => {
    const saved = localStorage.getItem('logica-da-grana-v4-historico')
    return saved ? JSON.parse(saved) : []
  })
  
  const [historicoTrocas, setHistoricoTrocas] = useState(() => {
    const saved = localStorage.getItem('logica-da-grana-v4-trocas')
    return saved ? JSON.parse(saved) : []
  })

  // Estados de navegação
  const [paginaAtual, setPaginaAtual] = useState('timeline') // 'timeline', 'historico', 'banco'
  const [paginaTimeline, setPaginaTimeline] = useState(1)
  const [paginaBanco, setPaginaBanco] = useState(1)
  
  // Estados de filtros
  const [filtroMes, setFiltroMes] = useState('todos')
  const [filtroPilar, setFiltroPilar] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')
  
  // Estados de modais
  const [modalTroca, setModalTroca] = useState(false)
  const [videoParaTrocar, setVideoParaTrocar] = useState(null)
  const [videoSelecionado, setVideoSelecionado] = useState(null)
  
  // Estados V4 - Criação de conteúdo
  const [modalNovaIdeia, setModalNovaIdeia] = useState(false)
  const [modalUploadLote, setModalUploadLote] = useState(false)
  const [modalExclusaoMassa, setModalExclusaoMassa] = useState(false)
  const [modalUploadTimeline, setModalUploadTimeline] = useState(false)
  const [novaIdeia, setNovaIdeia] = useState({
    titulo: '',
    pilar: 'Investimentos',
    mes: 'Janeiro',
    tema: '',
    formato: 'Educacional',
    duracao: '8-10 min',
    palavrasChave: [],
    cta: ''
  })
  const [arquivoUpload, setArquivoUpload] = useState(null)
  const [arquivoUploadTimeline, setArquivoUploadTimeline] = useState(null)

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('logica-da-grana-v4-timeline', JSON.stringify(timelineAtiva))
  }, [timelineAtiva])

  useEffect(() => {
    localStorage.setItem('logica-da-grana-v4-banco', JSON.stringify(bancoIdeias))
  }, [bancoIdeias])

  useEffect(() => {
    localStorage.setItem('logica-da-grana-v4-historico', JSON.stringify(historicoPostagens))
  }, [historicoPostagens])

  useEffect(() => {
    localStorage.setItem('logica-da-grana-v4-trocas', JSON.stringify(historicoTrocas))
  }, [historicoTrocas])

  // Resetar paginação quando mudar de página
  useEffect(() => {
    setPaginaTimeline(1)
    setPaginaBanco(1)
  }, [paginaAtual])

  // Função para atualizar status do vídeo
  const atualizarStatus = (id, novoStatus) => {
    if (novoStatus === 'postado') {
      const linkYoutube = prompt('Cole o link do vídeo no YouTube:')
      if (!linkYoutube) return

      const video = timelineAtiva.find(v => v.id === id)
      if (video) {
        const videoPostado = {
          ...video,
          status: 'postado',
          linkYoutube,
          dataPostagem: new Date().toISOString(),
          metricas: {
            visualizacoes: Math.floor(Math.random() * 10000) + 1000,
            likes: Math.floor(Math.random() * 500) + 50,
            comentarios: Math.floor(Math.random() * 100) + 10,
            compartilhamentos: Math.floor(Math.random() * 50) + 5
          }
        }

        setHistoricoPostagens(prev => [...prev, videoPostado])
        setTimelineAtiva(prev => prev.filter(v => v.id !== id))
        
        // Sugerir reposição do banco
        if (bancoIdeias.length > 0) {
          const sugestao = bancoIdeias.find(v => v.pilar === video.pilar)
          if (sugestao && confirm(`Deseja adicionar "${sugestao.titulo}" à Timeline Ativa?`)) {
            promoverParaTimeline(sugestao.id)
          }
        }
      }
    } else {
      setTimelineAtiva(prev => prev.map(video => 
        video.id === id ? { ...video, status: novoStatus } : video
      ))
    }
  }

  // Função para atualizar roteiro
  const atualizarRoteiro = (id, roteiro) => {
    setTimelineAtiva(prev => prev.map(video => 
      video.id === id ? { ...video, roteiro } : video
    ))
  }

  // Função para trocar vídeo
  const trocarVideo = () => {
    if (!videoParaTrocar || !videoSelecionado) return

    // Remover vídeo da timeline e adicionar ao banco
    const videoRemovido = { ...videoParaTrocar }
    delete videoRemovido.status
    delete videoRemovido.roteiro

    // Adicionar vídeo selecionado à timeline
    const novoVideo = {
      ...videoSelecionado,
      id: videoParaTrocar.id, // Manter o ID original para preservar posição
      status: 'pendente',
      roteiro: ''
    }

    setTimelineAtiva(prev => prev.map(v => 
      v.id === videoParaTrocar.id ? novoVideo : v
    ))

    setBancoIdeias(prev => [
      ...prev.filter(v => v.id !== videoSelecionado.id),
      videoRemovido
    ])

    // Registrar troca no histórico
    setHistoricoTrocas(prev => [...prev, {
      id: Date.now(),
      data: new Date().toISOString(),
      videoRemovido: videoParaTrocar.titulo,
      videoAdicionado: videoSelecionado.titulo,
      pilar: videoParaTrocar.pilar
    }])

    setModalTroca(false)
    setVideoParaTrocar(null)
    setVideoSelecionado(null)
  }

  // Função para promover vídeo do banco para timeline
  const promoverParaTimeline = (id) => {
    const video = bancoIdeias.find(v => v.id === id)
    if (!video) return

    const novoVideo = {
      ...video,
      id: `timeline_${Date.now()}`,
      status: 'pendente',
      roteiro: ''
    }

    setTimelineAtiva(prev => [...prev, novoVideo])
    setBancoIdeias(prev => prev.filter(v => v.id !== id))
  }

  // Função para atualizar data de vídeo com recálculo automático
  const atualizarDataVideo = (videoId, novaData) => {
    const videoIndex = timelineAtiva.findIndex(v => v.id === videoId)
    if (videoIndex === -1) return

    const novaDataObj = new Date(novaData)
    const diaSemana = novaDataObj.toLocaleDateString('pt-BR', { weekday: 'long' })
    
    // Atualizar o vídeo atual
    const timelineAtualizada = [...timelineAtiva]
    timelineAtualizada[videoIndex] = {
      ...timelineAtualizada[videoIndex],
      data: novaData,
      diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)
    }

    // Recalcular datas dos vídeos seguintes (3x por semana: segunda, quarta, sexta)
    const diasPostagem = [1, 3, 5] // Segunda=1, Quarta=3, Sexta=5
    let dataReferencia = new Date(novaData)
    
    for (let i = videoIndex + 1; i < timelineAtualizada.length; i++) {
      // Encontrar próximo dia de postagem
      let proximaData = new Date(dataReferencia)
      proximaData.setDate(proximaData.getDate() + 1)
      
      while (!diasPostagem.includes(proximaData.getDay())) {
        proximaData.setDate(proximaData.getDate() + 1)
      }
      
      const proximaDataStr = proximaData.toISOString().split('T')[0]
      const proximoDiaSemana = proximaData.toLocaleDateString('pt-BR', { weekday: 'long' })
      
      timelineAtualizada[i] = {
        ...timelineAtualizada[i],
        data: proximaDataStr,
        diaSemana: proximoDiaSemana.charAt(0).toUpperCase() + proximoDiaSemana.slice(1)
      }
      
      dataReferencia = proximaData
    }

    setTimelineAtiva(timelineAtualizada)
    localStorage.setItem('logica-da-grana-v4-timeline', JSON.stringify(timelineAtualizada))
  }

  // Funções V4 - Criação de conteúdo
  const adicionarNovaIdeia = () => {
    if (!novaIdeia.titulo.trim()) {
      alert('Título é obrigatório!')
      return
    }

    const novoId = Math.max(...bancoIdeias.map(v => v.id), ...timelineAtiva.map(v => v.id)) + 1
    const dataAtual = new Date().toISOString().split('T')[0]
    
    const ideiaCompleta = {
      id: novoId,
      titulo: novaIdeia.titulo,
      data: dataAtual,
      diaSemana: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
      pilar: novaIdeia.pilar,
      mes: novaIdeia.mes,
      tema: novaIdeia.tema || 'Personalizado',
      formato: novaIdeia.formato,
      duracao: novaIdeia.duracao,
      palavrasChave: novaIdeia.palavrasChave,
      cta: novaIdeia.cta || 'Saiba mais'
    }

    setBancoIdeias(prev => [...prev, ideiaCompleta])
    
    // Resetar formulário
    setNovaIdeia({
      titulo: '',
      pilar: 'Investimentos',
      mes: 'Janeiro',
      tema: '',
      formato: 'Educacional',
      duracao: '8-10 min',
      palavrasChave: [],
      cta: ''
    })
    
    setModalNovaIdeia(false)
    alert('Nova ideia adicionada ao Banco de Ideias!')
  }

  const processarUploadLote = (texto) => {
    try {
      const linhas = texto.split('\n').filter(linha => linha.trim())
      const novasIdeias = []
      
      for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i].trim()
        if (!linha) continue
        
        // Formato esperado: Título | Pilar | Tema | Formato | Duração | Palavras-chave | CTA
        const partes = linha.split('|').map(p => p.trim())
        
        if (partes.length >= 3) {
          const novoId = Math.max(...bancoIdeias.map(v => v.id), ...timelineAtiva.map(v => v.id), ...novasIdeias.map(v => v.id)) + 1
          const dataAtual = new Date().toISOString().split('T')[0]
          
          const novaIdeia = {
            id: novoId,
            titulo: partes[0] || 'Título não informado',
            data: dataAtual,
            diaSemana: new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
            pilar: partes[1] || 'Investimentos',
            mes: 'Personalizado',
            tema: partes[2] || 'Personalizado',
            formato: partes[3] || 'Educacional',
            duracao: partes[4] || '8-10 min',
            palavrasChave: partes[5] ? partes[5].split(',').map(p => p.trim()) : [],
            cta: partes[6] || 'Saiba mais'
          }
          
          novasIdeias.push(novaIdeia)
        }
      }
      
      if (novasIdeias.length > 0) {
        setBancoIdeias(prev => [...prev, ...novasIdeias])
        setModalUploadLote(false)
        setArquivoUpload(null)
        alert(`${novasIdeias.length} ideias adicionadas ao Banco de Ideias!`)
      } else {
        alert('Nenhuma ideia válida encontrada no arquivo.')
      }
    } catch (error) {
      alert('Erro ao processar arquivo. Verifique o formato.')
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const texto = e.target.result
      processarUploadLote(texto)
    }
    reader.readAsText(file)
  }

  // Funções V4 - Gestão em massa da Timeline
  const excluirTimelineCompleta = () => {
    if (confirm('Tem certeza que deseja excluir TODOS os vídeos da Timeline Ativa? Esta ação não pode ser desfeita.')) {
      setTimelineAtiva([])
      setModalExclusaoMassa(false)
      alert('Timeline Ativa foi limpa com sucesso!')
    }
  }

  const processarUploadTimeline = (texto) => {
    try {
      const linhas = texto.split('\n').filter(linha => linha.trim())
      const novosVideos = []
      
      for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i].trim()
        if (!linha) continue
        
        // Formato esperado: Título | Pilar | Data | Tema | Formato | Duração | Palavras-chave | CTA
        const partes = linha.split('|').map(p => p.trim())
        
        if (partes.length >= 4) {
          const novoId = Math.max(...timelineAtiva.map(v => v.id), ...bancoIdeias.map(v => v.id), 0) + i + 1
          const data = partes[2] || new Date().toISOString().split('T')[0]
          const dataObj = new Date(data)
          const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'long' })
          
          const novoVideo = {
            id: novoId,
            titulo: partes[0],
            pilar: partes[1] || 'Investimentos',
            data: data,
            diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
            tema: partes[3] || 'Educação Financeira',
            formato: partes[4] || 'Educacional',
            duracao: partes[5] || '8-10 min',
            palavrasChave: partes[6] ? partes[6].split(',').map(p => p.trim()) : [],
            cta: partes[7] || 'Saiba mais',
            status: 'pendente',
            roteiro: ''
          }
          
          novosVideos.push(novoVideo)
        }
      }
      
      if (novosVideos.length > 0) {
        setTimelineAtiva(prev => [...prev, ...novosVideos])
        setModalUploadTimeline(false)
        setArquivoUploadTimeline(null)
        alert(`${novosVideos.length} vídeos adicionados à Timeline Ativa com sucesso!`)
      } else {
        alert('Nenhum vídeo válido encontrado no arquivo.')
      }
    } catch (error) {
      alert('Erro ao processar arquivo. Verifique o formato.')
    }
  }

  const handleUploadTimeline = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const texto = e.target.result
      processarUploadTimeline(texto)
    }
    reader.readAsText(file)
  }

  // Aplicar filtros baseado na página atual
  const aplicarFiltros = (videos) => {
    return videos.filter(video => {
      const matchMes = filtroMes === 'todos' || 
        (video.data && new Date(video.data).getMonth() + 1 === parseInt(filtroMes))
      const matchPilar = filtroPilar === 'todos' || video.pilar === filtroPilar
      const matchStatus = filtroStatus === 'todos' || video.status === filtroStatus
      const matchBusca = busca === '' || 
        video.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        video.palavrasChave.some(palavra => palavra.toLowerCase().includes(busca.toLowerCase()))
      
      return matchMes && matchPilar && matchStatus && matchBusca
    })
  }

  // Obter vídeos filtrados para a página atual
  const getVideosFiltrados = () => {
    switch (paginaAtual) {
      case 'timeline':
        return aplicarFiltros(timelineAtiva)
      case 'banco':
        return aplicarFiltros(bancoIdeias)
      case 'historico':
        return aplicarFiltros(historicoPostagens)
      default:
        return []
    }
  }

  const videosFiltrados = getVideosFiltrados()
  const videosPerPage = 12
  const paginaAtualNum = paginaAtual === 'timeline' ? paginaTimeline : 
                        paginaAtual === 'banco' ? paginaBanco : 1
  const totalPaginas = Math.ceil(videosFiltrados.length / videosPerPage)
  const videosExibidos = videosFiltrados.slice(
    (paginaAtualNum - 1) * videosPerPage,
    paginaAtualNum * videosPerPage
  )

  // Função para mudar página
  const mudarPagina = (novaPagina) => {
    if (paginaAtual === 'timeline') {
      setPaginaTimeline(novaPagina)
    } else if (paginaAtual === 'banco') {
      setPaginaBanco(novaPagina)
    }
  }

  // Obter cor do pilar
  const getCorPilar = (pilar) => {
    switch (pilar) {
      case 'Investimentos': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Proteção': return 'bg-green-100 text-green-800 border-green-200'
      case 'Crédito': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Obter estatísticas
  const stats = {
    totalTimeline: timelineAtiva.length,
    totalBanco: bancoIdeias.length,
    totalHistorico: historicoPostagens.length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">A Lógica da Grana V4</h1>
              </div>
              <Badge variant="outline" className="text-xs">
                Cronograma Dinâmico + Criação
              </Badge>
            </div>
            
            {/* Navegação entre páginas */}
            <div className="flex space-x-2">
              <Button
                variant={paginaAtual === 'timeline' ? 'default' : 'outline'}
                onClick={() => setPaginaAtual('timeline')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Timeline Ativa ({stats.totalTimeline})
              </Button>
              <Button
                variant={paginaAtual === 'historico' ? 'default' : 'outline'}
                onClick={() => setPaginaAtual('historico')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Histórico de Postagens ({stats.totalHistorico})
              </Button>
              <Button
                variant={paginaAtual === 'banco' ? 'default' : 'outline'}
                onClick={() => setPaginaAtual('banco')}
                className="flex items-center gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Banco de Ideias ({stats.totalBanco})
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard de Progresso */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dashboard V4 - Gestão Dinâmica + Criação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTimeline}</div>
                <div className="text-sm text-gray-600">Timeline Ativa</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.totalHistorico}</div>
                <div className="text-sm text-gray-600">Vídeos Postados</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.totalBanco}</div>
                <div className="text-sm text-gray-600">Banco de Ideias</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{historicoTrocas.length}</div>
                <div className="text-sm text-gray-600">Trocas Realizadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros - apenas para Timeline e Banco */}
        {(paginaAtual === 'timeline' || paginaAtual === 'banco') && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>
                
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os meses</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                    <SelectItem value="1">Janeiro</SelectItem>
                    <SelectItem value="2">Fevereiro</SelectItem>
                    <SelectItem value="3">Março</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroPilar} onValueChange={setFiltroPilar}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Pilar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os pilares</SelectItem>
                    <SelectItem value="Investimentos">Investimentos</SelectItem>
                    <SelectItem value="Proteção">Proteção</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                  </SelectContent>
                </Select>

                {paginaAtual === 'timeline' && (
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os status</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="produzido">Produzido</SelectItem>
                      <SelectItem value="editado">Editado</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <div className="flex items-center space-x-2 flex-1 max-w-md">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por título ou palavra-chave..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conteúdo baseado na página atual */}
        {paginaAtual === 'timeline' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Timeline Ativa - Vídeos Planejados</h2>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalExclusaoMassa(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir em Massa
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalUploadTimeline(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Timeline
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {videosFiltrados.length} vídeos encontrados
                </div>
              </div>
            </div>

            {/* Grid de vídeos da Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {videosExibidos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getCorPilar(video.pilar)}>
                        {video.pilar}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setVideoParaTrocar(video)
                          setModalTroca(true)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base leading-tight">
                      {video.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Informações do vídeo */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <input
                          type="date"
                          value={video.data}
                          onChange={(e) => atualizarDataVideo(video.id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <span className="text-xs">({video.diaSemana})</span>
                    </div>
                    
                    {/* Campo de roteiro */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Roteiro:</label>
                      <textarea
                        placeholder="Digite o roteiro do vídeo..."
                        value={video.roteiro || ''}
                        onChange={(e) => atualizarRoteiro(video.id, e.target.value)}
                        className="w-full p-2 text-sm border rounded-md resize-none h-20"
                      />
                      {video.roteiro && (
                        <div className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Roteiro salvo
                        </div>
                      )}
                    </div>

                    {/* Botões de status */}
                    <div className="flex space-x-2">
                      <Button
                        variant={video.status === 'produzido' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => atualizarStatus(video.id, 'produzido')}
                        className="flex-1"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Produzido
                      </Button>
                      <Button
                        variant={video.status === 'editado' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => atualizarStatus(video.id, 'editado')}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editado
                      </Button>
                      <Button
                        variant={video.status === 'postado' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => atualizarStatus(video.id, 'postado')}
                        className="flex-1"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Postado
                      </Button>
                    </div>

                    {/* Indicadores */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {video.duracao}
                      </div>
                      <div className="text-blue-600 font-medium">
                        {video.cta}
                      </div>
                    </div>

                    {/* Palavras-chave */}
                    <div className="flex flex-wrap gap-1">
                      {video.palavrasChave.slice(0, 3).map((palavra, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {palavra}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {paginaAtual === 'banco' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Banco de Ideias - Repositório de Temas</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setModalNovaIdeia(true)}
                    className="flex items-center gap-2"
                    variant="default"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Ideia
                  </Button>
                  <Button
                    onClick={() => setModalUploadLote(true)}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4" />
                    Upload em Lote
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {videosFiltrados.length} vídeos disponíveis
                </div>
              </div>
            </div>

            {/* Grid de vídeos do Banco */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {videosExibidos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getCorPilar(video.pilar)}>
                        {video.pilar}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {video.mes}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-tight">
                      {video.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Informações do vídeo */}
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {video.data} ({video.diaSemana})
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <strong>Tema:</strong> {video.tema}
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Formato:</strong> {video.formato}
                    </div>

                    {/* Botão para promover */}
                    <Button
                      onClick={() => promoverParaTimeline(video.id)}
                      className="w-full"
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Promover para Timeline
                    </Button>

                    {/* Indicadores */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {video.duracao}
                      </div>
                      <div className="text-blue-600 font-medium">
                        {video.cta}
                      </div>
                    </div>

                    {/* Palavras-chave */}
                    <div className="flex flex-wrap gap-1">
                      {video.palavrasChave.slice(0, 3).map((palavra, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {palavra}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {paginaAtual === 'historico' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Histórico de Postagens</h2>
              <div className="text-sm text-gray-600">
                {historicoPostagens.length} vídeos postados
              </div>
            </div>

            {historicoPostagens.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum vídeo postado ainda
                  </h3>
                  <p className="text-gray-600">
                    Os vídeos marcados como "Postado" aparecerão aqui com métricas detalhadas.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {historicoPostagens.map((video) => (
                  <Card key={video.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCorPilar(video.pilar)}>
                              {video.pilar}
                            </Badge>
                            <Badge variant="outline" className="text-green-600">
                              Postado
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{video.titulo}</h3>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            Postado em: {new Date(video.dataPostagem).toLocaleDateString('pt-BR')}
                          </div>
                          {video.linkYoutube && (
                            <a 
                              href={video.linkYoutube} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Ver no YouTube →
                            </a>
                          )}
                        </div>
                        
                        {/* Métricas */}
                        {video.metricas && (
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-blue-600">
                                {video.metricas.visualizacoes.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Visualizações</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {video.metricas.likes.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Likes</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-orange-600">
                                {video.metricas.comentarios.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Comentários</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-600">
                                {video.metricas.compartilhamentos.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">Compartilhamentos</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Roteiro */}
                      {video.roteiro && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Roteiro:</h4>
                          <p className="text-sm text-gray-600">{video.roteiro}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => mudarPagina(paginaAtualNum - 1)}
              disabled={paginaAtualNum === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
              <Button
                key={pagina}
                variant={pagina === paginaAtualNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => mudarPagina(pagina)}
              >
                {pagina}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => mudarPagina(paginaAtualNum + 1)}
              disabled={paginaAtualNum === totalPaginas}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Troca */}
      <Dialog open={modalTroca} onOpenChange={setModalTroca}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trocar Vídeo da Timeline</DialogTitle>
          </DialogHeader>
          
          {videoParaTrocar && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-800 mb-2">Vídeo a ser removido:</h3>
                <p className="text-red-700">{videoParaTrocar.titulo}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Escolha um vídeo do Banco de Ideias:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {bancoIdeias
                    .filter(v => v.pilar === videoParaTrocar.pilar)
                    .map((video) => (
                    <Card 
                      key={video.id} 
                      className={`cursor-pointer transition-all ${
                        videoSelecionado?.id === video.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setVideoSelecionado(video)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCorPilar(video.pilar)}>
                            {video.pilar}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {video.mes}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mb-2">{video.titulo}</h4>
                        <p className="text-xs text-gray-600">{video.tema}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setModalTroca(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={trocarVideo}
                  disabled={!videoSelecionado}
                >
                  Confirmar Troca
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal V4 - Nova Ideia */}
      <Dialog open={modalNovaIdeia} onOpenChange={setModalNovaIdeia}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Nova Ideia ao Banco
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título do Vídeo *</label>
              <Input
                value={novaIdeia.titulo}
                onChange={(e) => setNovaIdeia(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Como Investir em Ações para Iniciantes"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Pilar</label>
                <Select 
                  value={novaIdeia.pilar} 
                  onValueChange={(value) => setNovaIdeia(prev => ({ ...prev, pilar: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Investimentos">Investimentos</SelectItem>
                    <SelectItem value="Proteção">Proteção</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mês</label>
                <Select 
                  value={novaIdeia.mes} 
                  onValueChange={(value) => setNovaIdeia(prev => ({ ...prev, mes: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Janeiro">Janeiro</SelectItem>
                    <SelectItem value="Fevereiro">Fevereiro</SelectItem>
                    <SelectItem value="Março">Março</SelectItem>
                    <SelectItem value="Abril">Abril</SelectItem>
                    <SelectItem value="Maio">Maio</SelectItem>
                    <SelectItem value="Junho">Junho</SelectItem>
                    <SelectItem value="Julho">Julho</SelectItem>
                    <SelectItem value="Agosto">Agosto</SelectItem>
                    <SelectItem value="Setembro">Setembro</SelectItem>
                    <SelectItem value="Outubro">Outubro</SelectItem>
                    <SelectItem value="Novembro">Novembro</SelectItem>
                    <SelectItem value="Dezembro">Dezembro</SelectItem>
                    <SelectItem value="Personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tema</label>
                <Input
                  value={novaIdeia.tema}
                  onChange={(e) => setNovaIdeia(prev => ({ ...prev, tema: e.target.value }))}
                  placeholder="Ex: Educação Financeira"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Formato</label>
                <Select 
                  value={novaIdeia.formato} 
                  onValueChange={(value) => setNovaIdeia(prev => ({ ...prev, formato: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Educacional">Educacional</SelectItem>
                    <SelectItem value="Comparativos">Comparativos</SelectItem>
                    <SelectItem value="Análise de Mercado">Análise de Mercado</SelectItem>
                    <SelectItem value="Tendências">Tendências</SelectItem>
                    <SelectItem value="Estratégia">Estratégia</SelectItem>
                    <SelectItem value="Checklist">Checklist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duração</label>
                <Select 
                  value={novaIdeia.duracao} 
                  onValueChange={(value) => setNovaIdeia(prev => ({ ...prev, duracao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6-8 min">6-8 min</SelectItem>
                    <SelectItem value="8-10 min">8-10 min</SelectItem>
                    <SelectItem value="10-12 min">10-12 min</SelectItem>
                    <SelectItem value="12-15 min">12-15 min</SelectItem>
                    <SelectItem value="15-20 min">15-20 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CTA (Call to Action)</label>
                <Input
                  value={novaIdeia.cta}
                  onChange={(e) => setNovaIdeia(prev => ({ ...prev, cta: e.target.value }))}
                  placeholder="Ex: Comece a investir hoje"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Palavras-chave (separadas por vírgula)</label>
              <Input
                value={novaIdeia.palavrasChave.join(', ')}
                onChange={(e) => setNovaIdeia(prev => ({ 
                  ...prev, 
                  palavrasChave: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                }))}
                placeholder="Ex: investimentos, ações, iniciantes"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setModalNovaIdeia(false)}>
                Cancelar
              </Button>
              <Button onClick={adicionarNovaIdeia}>
                <Save className="h-4 w-4 mr-2" />
                Adicionar ao Banco
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal V4 - Upload em Lote */}
      <Dialog open={modalUploadLote} onOpenChange={setModalUploadLote}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload em Lote - Múltiplas Ideias
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Formato do Arquivo:</h4>
              <p className="text-sm text-blue-800 mb-2">
                Cada linha deve conter uma ideia no formato:
              </p>
              <code className="text-xs bg-blue-100 p-2 rounded block">
                Título | Pilar | Tema | Formato | Duração | Palavras-chave | CTA
              </code>
              <p className="text-xs text-blue-700 mt-2">
                Exemplo: "Como Investir em Ações | Investimentos | Educação | Educacional | 10-12 min | ações,investir,iniciantes | Comece hoje"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Selecionar Arquivo (.txt)</label>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Dicas:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Use "|" (pipe) para separar os campos</li>
                <li>• Título é obrigatório, outros campos são opcionais</li>
                <li>• Palavras-chave devem ser separadas por vírgula</li>
                <li>• Linhas vazias serão ignoradas</li>
                <li>• Máximo recomendado: 50 ideias por arquivo</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setModalUploadLote(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal V4 - Exclusão em Massa */}
      <Dialog open={modalExclusaoMassa} onOpenChange={setModalExclusaoMassa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Timeline Completa
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium mb-2">⚠️ Atenção: Ação Irreversível</p>
              <p className="text-sm text-red-700">
                Esta ação irá excluir TODOS os {timelineAtiva.length} vídeos da Timeline Ativa permanentemente. 
                Esta operação não pode ser desfeita.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium mb-2">💡 Alternativa Recomendada</p>
              <p className="text-sm text-yellow-700">
                Considere usar o "Upload Timeline" para substituir o conteúdo atual em vez de excluir tudo.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setModalExclusaoMassa(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={excluirTimelineCompleta}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal V4 - Upload Timeline */}
      <Dialog open={modalUploadTimeline} onOpenChange={setModalUploadTimeline}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload em Lote - Timeline Ativa
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Formato do Arquivo para Timeline:</h4>
              <p className="text-sm text-green-800 mb-2">
                Cada linha deve conter um vídeo no formato:
              </p>
              <code className="text-xs bg-green-100 p-2 rounded block">
                Título | Pilar | Data | Tema | Formato | Duração | Palavras-chave | CTA
              </code>
              <p className="text-xs text-green-700 mt-2">
                Exemplo: "Bem-vindos ao Canal | Investimentos | 2025-10-06 | Apresentação | Educacional | 10-15 min | canal,apresentação | Conheça o canal"
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Selecionar Arquivo (.txt)</label>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    setArquivoUploadTimeline(file)
                    handleUploadTimeline(file)
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Dicas para Timeline:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Data:</strong> Use formato YYYY-MM-DD (ex: 2025-10-06)</li>
                <li>• <strong>Pilar:</strong> Investimentos, Proteção ou Crédito</li>
                <li>• <strong>Ordem:</strong> Vídeos serão adicionados na ordem do arquivo</li>
                <li>• <strong>Status:</strong> Todos começam como "Pendente"</li>
                <li>• <strong>Roteiro:</strong> Campo fica vazio para preenchimento posterior</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setModalUploadTimeline(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App

