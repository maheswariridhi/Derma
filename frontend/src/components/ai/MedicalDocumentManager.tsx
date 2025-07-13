import React, { useState, useEffect } from 'react';
import MedicalDocumentService, { DocumentAnalysis } from '../../services/MedicalDocumentService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Upload, 
  Search, 
  FileText, 
  Trash2, 
  Eye, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  File,
  Bot
} from 'lucide-react';

interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  distance: number;
  created_at: string;
}

interface MedicalDocumentManagerProps {
  patientId?: string;
  doctorId?: string;
  className?: string;
}

interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  distance?: number;
}

const MedicalDocumentManager: React.FC<MedicalDocumentManagerProps> = ({
  patientId,
  doctorId,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'analyze'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [documentType, setDocumentType] = useState('medical_document');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Analysis state
  const [analysisContent, setAnalysisContent] = useState('');
  const [analysisType, setAnalysisType] = useState('report');
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Stats state
  const [stats, setStats] = useState<{
    documents_count: number;
    chat_messages_count: number;
    total_items: number;
  } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await MedicalDocumentService.getVectorDBStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile && !documentContent.trim()) {
      setError('Please select a file or enter document content');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (selectedFile) {
        await MedicalDocumentService.uploadDocument(
          selectedFile,
          patientId,
          doctorId,
          documentType
        );
        setSuccess(`File "${selectedFile.name}" uploaded successfully`);
        setSelectedFile(null);
      } else {
        await MedicalDocumentService.addDocument(documentContent, {
          patient_id: patientId,
          doctor_id: doctorId,
          document_type: documentType
        });
        setSuccess('Document content added successfully');
        setDocumentContent('');
      }
      
      // Reload stats
      await loadStats();
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const result = await MedicalDocumentService.searchDocuments(searchQuery, 10);
      setSearchResults(result.results);
    } catch (error) {
      console.error('Error searching documents:', error);
      setError('Failed to search documents. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analysisContent.trim()) {
      setError('Please enter document content to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await MedicalDocumentService.analyzeDocument(analysisContent, analysisType);
      setAnalysisResult(result.analysis);
    } catch (error) {
      console.error('Error analyzing document:', error);
      setError('Failed to analyze document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await MedicalDocumentService.deleteDocument(documentId);
      setSearchResults(prev => prev.filter(doc => doc.id !== documentId));
      setSuccess('Document deleted successfully');
      await loadStats();
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Card */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vector Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.documents_count}</div>
                <div className="text-sm text-gray-600">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.chat_messages_count}</div>
                <div className="text-sm text-gray-600">Chat Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.total_items}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'upload' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('upload')}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
        <Button
          variant={activeTab === 'search' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('search')}
          className="flex-1"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button
          variant={activeTab === 'analyze' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('analyze')}
          className="flex-1"
        >
          <Bot className="h-4 w-4 mr-2" />
          Analyze
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-600">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600">{success}</span>
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Medical Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_document">Medical Document</SelectItem>
                  <SelectItem value="report">Medical Report</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="lab_result">Lab Result</SelectItem>
                  <SelectItem value="note">Clinical Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload File</label>
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".txt,.pdf,.doc,.docx,.rtf"
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: TXT, PDF, DOC, DOCX, RTF
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Document Content</label>
              <Textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                placeholder="Paste or type document content here..."
                rows={6}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={isLoading || (!selectedFile && !documentContent.trim())}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Search Medical Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for medical information..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Search Results ({searchResults.length})</h3>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <Card key={result.id} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              {result.metadata.filename || 'Document'}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(result.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {result.content.substring(0, 200)}...
                        </p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Type: {result.metadata.document_type}</span>
                          <span>Added: {formatDate(result.metadata.created_at)}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analyze Tab */}
      {activeTab === 'analyze' && (
        <Card>
          <CardHeader>
            <CardTitle>Analyze Medical Document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="report">Medical Report</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="lab_result">Lab Result</SelectItem>
                  <SelectItem value="note">Clinical Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Document Content</label>
              <Textarea
                value={analysisContent}
                onChange={(e) => setAnalysisContent(e.target.value)}
                placeholder="Paste the medical document content to analyze..."
                rows={8}
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !analysisContent.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bot className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
            </Button>

            {analysisResult && (
              <div className="space-y-4 mt-6">
                <h3 className="font-medium">Analysis Results</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Key Findings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {analysisResult.key_findings.map((finding, index) => (
                          <li key={index} className="text-sm">• {finding}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {analysisResult.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm">• {rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {analysisResult.urgent_items.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-red-700">Urgent Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {analysisResult.urgent_items.map((item, index) => (
                          <li key={index} className="text-sm text-red-700">• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Patient Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{analysisResult.patient_summary}</p>
                  </CardContent>
                </Card>

                <div className="flex justify-between items-center text-sm">
                  <span>Confidence Level: 
                    <span className={`ml-1 font-medium ${
                      analysisResult.confidence_level === 'High' ? 'text-green-600' :
                      analysisResult.confidence_level === 'Medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {analysisResult.confidence_level}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalDocumentManager; 