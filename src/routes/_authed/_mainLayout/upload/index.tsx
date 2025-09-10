import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Stack, Text, Card, Group, Badge, Button, Collapse, Table, ActionIcon, Divider, Box} from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconUpload, IconEye, IconTrash, IconEdit, IconArrowsSort, IconUser, IconBuilding, IconShield } from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';
import { useUploadDocument, useGetDocumentsForLoanApplication } from "~/api/document-api";
import { useGetLoanApplication } from "~/api/loan-application-api";
import { ProcessingState, DocumentKind } from "@krida/proto-client/alexandria";
import styles from "./upload.module.css";

// Real loan application ID for LN-db0b97
// const REAL_LOAN_APPLICATION_ID = '00ff920b-5409-4f83-a84a-64a973db0b97';
 const REAL_LOAN_APPLICATION_ID = 'ef14a8cc-b89d-4cd4-a2f8-e0b508c8d263';

// Helper functions for document display
const getDocumentDisplayName = (kind: any): string => {
  const kindNum = Number(kind);
  const kindMap: { [key: number]: string } = {
    2: 'Tax Returns', // DOCUMENT_KIND_OWNER_TAX_RETURN_CURRENT
    3: 'Tax Returns', // DOCUMENT_KIND_OWNER_TAX_RETURN_PRIOR_1
    4: 'Tax Returns', // DOCUMENT_KIND_OWNER_TAX_RETURN_PRIOR_2
    5: 'ID', // DOCUMENT_KIND_OWNER_DRIVERS_LICENSE
    6: 'ID', // DOCUMENT_KIND_OWNER_PASSPORT
    12: 'Articles of Incorporation', // DOCUMENT_KIND_BUSINESS_ARTICLES_INCORPORATION
    13: 'Business Statement', // DOCUMENT_KIND_BUSINESS_STATEMENT_INFORMATION
    14: 'EIN Confirmation', // DOCUMENT_KIND_BUSINESS_EIN_CONFIRMATION
    15: 'Business Tax Return', // DOCUMENT_KIND_BUSINESS_TAX_RETURN_CURRENT
    16: 'Business Tax Return', // DOCUMENT_KIND_BUSINESS_TAX_RETURN_PRIOR_1
    17: 'Business Tax Return', // DOCUMENT_KIND_BUSINESS_TAX_RETURN_PRIOR_2
    18: 'YTD Financial Statement', // DOCUMENT_KIND_BUSINESS_YTD_FINANCIAL_STATEMENT
    19: 'Audited Financials', // DOCUMENT_KIND_BUSINESS_AUDITED_FINANCIALS
    20: 'AR/AP Aging', // DOCUMENT_KIND_BUSINESS_AR_AP_AGING
    21: 'Bank Statement', // DOCUMENT_KIND_BUSINESS_BANK_STATEMENT
  };
  return kindMap[kindNum] || `Document ${kindNum}`;
};

const getDocumentSubName = (kind: any): string => {
  const kindNum = Number(kind);
  const subNameMap: { [key: number]: string } = {
    2: 'Most Recent Year', // DOCUMENT_KIND_OWNER_TAX_RETURN_CURRENT
    3: 'Prior Year 1', // DOCUMENT_KIND_OWNER_TAX_RETURN_PRIOR_1
    4: 'Prior Year 2', // DOCUMENT_KIND_OWNER_TAX_RETURN_PRIOR_2
    5: 'Driver\'s License', // DOCUMENT_KIND_OWNER_DRIVERS_LICENSE
    6: 'Passport', // DOCUMENT_KIND_OWNER_PASSPORT
    15: 'Current Year', // DOCUMENT_KIND_BUSINESS_TAX_RETURN_CURRENT
    16: 'Prior Year 1', // DOCUMENT_KIND_BUSINESS_TAX_RETURN_PRIOR_1
    17: 'Prior Year 2', // DOCUMENT_KIND_BUSINESS_TAX_RETURN_PRIOR_2
  };
  return subNameMap[kindNum] || '';
};

const getDocumentStatus = (state: any, hasFile: boolean): string => {
  // If no file is uploaded, status is always 'Missing'
  if (!hasFile) {
    return 'Missing';
  }
  
  const stateNum = Number(state);
  const statusMap: { [key: number]: string } = {
    0: 'Missing', // PROCESSING_STATE_PENDING
    1: 'Processing', // PROCESSING_STATE_PROCESSING
    2: 'Good', // PROCESSING_STATE_COMPLETED
    // TODO: Blurry is not a valid status
    3: 'Missing', // PROCESSING_STATE_FAILED - treat as Missing instead of Blurry
  };
  return statusMap[stateNum] || 'Missing';
};

const statusColors: { [key: string]: string } = {
  Good: 'green',
//   Blurry: 'yellow',
  Missing: 'red',
  Processing: 'gray'
};

type Doc = {
  document: string;
  subdocument: string;
  file: string;
  status: string;
  actions: string[];
  documentId: string;
  _originalIndex?: number;
};

type DocWithIndex = Doc & { _originalIndex: number };

function sectionStatus(docs: Doc[]) {
  const completed = docs.filter((d: Doc) => d.status === 'Good').length;
  return {
    completed,
    total: docs.length,
    isComplete: completed === docs.length,
  };
}

const columns = [
  { key: 'document', label: 'Document' },
  { key: 'subdocument', label: 'Sub-document' },
  { key: 'file', label: 'File' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
];

function SectionHeader({
  title,
  completed,
  total,
  isOpen,
  onToggle,
  isComplete,
  icon,
}: {
  title: string;
  completed: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  isComplete: boolean;
  icon?: React.ReactNode;
}) {
    return (
        <Group
            justify="space-between"
            mb={2}
            role="button"
            tabIndex={0}
            aria-label={`Toggle ${title} section`}
            onClick={onToggle}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
            data-section-header
            className={styles.sectionHeader}
        >
            <Group gap={8}>
                {icon && <Box style={{ color: '#72767e' }}>{icon}</Box>}
                <Stack gap={4}>
                    <Text fw={600} size="md">{title}</Text>
                    <Text c="dimmed" size="sm">{completed}/{total} documents completed</Text>
                </Stack>
            </Group>
            <Group gap={8}>
                <Badge color={isComplete ? 'green' : 'red'} variant="light">
                {isComplete ? 'Complete' : 'Incomplete'}
                </Badge>
                {isOpen ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
            </Group>
        </Group>
    );
}

interface SortableTableProps {
    docs: Doc[];
    sortBy: keyof DocWithIndex | '';
    sortDir: 'asc' | 'desc' | 'original';
    onSort: (key: keyof DocWithIndex) => void;
    uploadDocument: any;
    uploadedDocs: {[key: string]: {documentId: string, filename: string}};
    setUploadedDocs: React.Dispatch<React.SetStateAction<{[key: string]: {documentId: string, filename: string}}>>;
}

function SortableTable({ docs, sortBy, sortDir, onSort, uploadDocument, setUploadedDocs }: SortableTableProps) {
    const docsWithIndex: DocWithIndex[] = docs.map((doc, i) => ({ ...doc, _originalIndex: i }));
    let sortedDocs = [...docsWithIndex];
    if (sortBy && sortDir !== 'original' && sortBy !== 'actions') {
        sortedDocs.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    } else if (sortDir === 'original') {
        sortedDocs.sort((a, b) => a._originalIndex - b._originalIndex);
    }
    return (
        <Table withRowBorders withColumnBorders style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
                <col style={{ width: '29%' }} />
                <col style={{ width: '27%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
            </colgroup>
            <thead style={{ borderBottom: '2px solid #e9ecef' }}>
                <tr>
                {columns.map((col, colIdx) => (
                    <th
                    key={col.key}
                    style={{
                        textAlign: 'left',
                        fontWeight: 500,
                        borderBottom: '2px solid #e9ecef',
                        verticalAlign: 'middle',
                        paddingRight: 8,
                        ...(colIdx === 0 ? { paddingLeft: 16 } : {}),
                    }}
                    >
                    <Group gap={4} align="center" wrap="nowrap">
                        <span>{col.label}</span>
                        {col.key !== 'actions' && (
                        <ActionIcon
                            size="sm"
                            variant="subtle"
                            aria-label={`Sort by ${col.label}`}
                            onClick={e => {
                            e.stopPropagation();
                            onSort(col.key as keyof DocWithIndex);
                            }}
                            style={{ marginLeft: 2 }}
                        >
                            <IconArrowsSort size={14} stroke={1.7} style={{ opacity: sortBy === col.key ? 1 : 0.5 }} />
                        </ActionIcon>
                        )}
                        {col.key !== 'actions' && sortBy === col.key && sortDir !== 'original' && (
                        <span style={{ fontSize: 12 }}>{sortDir === 'asc' ? '▲' : '▼'}</span>
                        )}
                    </Group>
                    </th>
                ))}
                </tr>
            </thead>
            <tbody>
                {sortedDocs.map((doc, idx) => (
                <tr key={idx} style={{ borderBottom: idx !== sortedDocs.length - 1 ? '1px solid #e9ecef' : undefined }}>
                    <td style={{ paddingLeft: 16 }}>{doc.document}</td>
                    <td>{doc.subdocument}</td>
                    <td>
                    {doc.file ? (
                        <Button 
                            variant="subtle" 
                            size="xs" 
                            leftSection={<IconEye size={14} />}
                            component={Link}
                            to={`/application/${REAL_LOAN_APPLICATION_ID}/document/${doc.documentId}/`}
                        >
                        {doc.file}
                        </Button>
                    ) : (
                        <Button 
                            variant="light" 
                            size="xs" 
                            leftSection={<IconUpload size={14} />}
                            onClick={() => {
                                // Create a hidden file input
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*,.pdf,.doc,.docx';
                                input.style.display = 'none';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                        // Handle file upload logic here
                                        console.log('File selected:', file);
                                        // Create a mock document object for upload
                                        const mockDocument = {
                                            id: doc.documentId,
                                            loanApplicationId: REAL_LOAN_APPLICATION_ID,
                                            originalFilename: file.name,
                                            mimeType: file.type,
                                            state: ProcessingState.PROCESSING_STATE_PENDING,
                                            orgName: '',
                                            kind: DocumentKind.DOCUMENT_KIND_CUSTOM,
                                            uploaderUserId: '',
                                            uploadDate: new Date(),
                                            s3Url: '',
                                            rawMetadata: undefined,
                                            customMetadata: undefined,
                                            meta: undefined
                                        };
                                        
                                        const payload = new FormData();
                                        payload.append("loanApplicationId", mockDocument.loanApplicationId);
                                        payload.append("file", file);
                                        payload.append("documentId", mockDocument.id);
                                        uploadDocument.mutate({
                                            data: payload,
                                        }, {
                                            onSuccess: (response: any) => {
                                                console.log('Upload successful! Real document ID:', response.documentId);
                                                // Create a unique key for documents with empty IDs using their position
                                                const uniqueKey = doc.documentId === '' ? `empty-${idx}` : doc.documentId;
                                                // Update the UI to show the uploaded document
                                                setUploadedDocs(prev => ({
                                                    ...prev,
                                                    [uniqueKey]: {
                                                        documentId: response.documentId,
                                                        filename: file.name
                                                    }
                                                }));
                                                alert(`Document uploaded successfully! Document ID: ${response.documentId}`);
                                            },
                                            onError: (error: any) => {
                                                console.error('Upload failed:', error);
                                                alert('Upload failed. Please try again.');
                                            }
                                        });
                                    }
                                };
                                document.body.appendChild(input);
                                input.click();
                                document.body.removeChild(input);
                            }}
                        >
                            Upload
                        </Button>
                    )}
                    </td>
                    <td>
                    <Badge color={statusColors[doc.status] || 'gray'} variant="light">
                        {doc.status}
                    </Badge>
                    </td>
                    <td>
                    <Group gap={4}>
                        {doc.actions.includes('fix') && (
                        <ActionIcon color="yellow" variant="light"><IconEdit size={16} /></ActionIcon>
                        )}
                                                {doc.actions.includes('delete') && (
                        <ActionIcon color="red" variant="light">
                            <IconTrash size={16} />
                        </ActionIcon>
                    )}
                        {doc.actions.includes('none') && <Text size="xs" c="dimmed">None</Text>}
                    </Group>
                    </td>
                </tr>
                ))}
            </tbody>
        </Table>
    );
}

export const Route = createFileRoute('/_authed/_mainLayout/upload/')({
    component: UploadPage,
});

function UploadPage() {
    const [opened, setOpened] = useState<{ owner: boolean; guarantor: boolean; business: boolean; real: boolean }>({ owner: true, guarantor: false, business: false, real: true });
    const [sort, setSort] = useState<{
        owner: { by: keyof DocWithIndex | ''; dir: 'asc' | 'desc' | 'original' };
        guarantor: { by: keyof DocWithIndex | ''; dir: 'asc' | 'desc' | 'original' };
        business: { by: keyof DocWithIndex | ''; dir: 'asc' | 'desc' | 'original' };
        real: { by: keyof DocWithIndex | ''; dir: 'asc' | 'desc' | 'original' };
    }>({ owner: { by: '', dir: 'original' }, guarantor: { by: '', dir: 'original' }, business: { by: '', dir: 'original' }, real: { by: '', dir: 'original' } });
    
    // Track uploaded documents
    const [uploadedDocs, setUploadedDocs] = useState<{[key: string]: {documentId: string, filename: string}}>({});
    
    const uploadDocument = useUploadDocument();
    
    // Fetch real loan application and documents
    const { data: loanApplication, isLoading: loanLoading, error: loanError } = useGetLoanApplication(REAL_LOAN_APPLICATION_ID);
    const { data: uploadedDocuments, isLoading: docsLoading, error: docsError } = useGetDocumentsForLoanApplication(REAL_LOAN_APPLICATION_ID);
    

    
    // Generate document lists from real data
    const generateDocumentLists = () => {
        if (!loanApplication || !uploadedDocuments) {
            return { ownerDocs: [], guarantorDocs: [], businessDocs: [] };
        }
        
        const ownerDocs: Doc[] = [];
        const guarantorDocs: Doc[] = [];
        const businessDocs: Doc[] = [];
        
        uploadedDocuments.forEach((doc: any) => {
            // Treat documents with PENDING state as if they have no file (for unuploaded documents)
            const isPending = doc.state === 0; // PROCESSING_STATE_PENDING
            const hasFile = !!doc.originalFilename && !isPending;
            const docEntry: Doc = {
                document: getDocumentDisplayName(doc.kind),
                subdocument: getDocumentSubName(doc.kind),
                file: hasFile ? doc.originalFilename : '',
                status: getDocumentStatus(doc.state, hasFile),
                actions: hasFile ? ['view', 'delete'] : [],
                documentId: doc.id,
                _originalIndex: 0
            };
            
            // Handle numeric enum values by mapping them to document types
            // Based on the protobuf definitions:
            const ownerKinds = [2, 3, 4, 5, 6]; // OWNER_TAX_RETURN_CURRENT, PRIOR_1, PRIOR_2, DRIVERS_LICENSE, PASSPORT
            const businessKinds = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]; // All BUSINESS_* and CRE_* kinds
            
            if (ownerKinds.includes(Number(doc.kind))) {
                ownerDocs.push(docEntry);
            } else if (businessKinds.includes(Number(doc.kind))) {
                businessDocs.push(docEntry);
            } else {
                guarantorDocs.push(docEntry);
            }
        });
        
        return { ownerDocs, guarantorDocs, businessDocs };
    };
    
    const { ownerDocs: realOwnerDocs, guarantorDocs: realGuarantorDocs, businessDocs: realBusinessDocs } = generateDocumentLists();
    
    // Use real data if available, otherwise fall back to empty arrays
    const displayOwnerDocs = realOwnerDocs.length > 0 ? realOwnerDocs : [];
    const displayGuarantorDocs = realGuarantorDocs.length > 0 ? realGuarantorDocs : [];
    const displayBusinessDocs = realBusinessDocs.length > 0 ? realBusinessDocs : [];
    

    
    const handleSort = (section: 'owner' | 'guarantor' | 'business' | 'real', key: keyof DocWithIndex) => {
        setSort((prev) => {
        if (prev[section].by !== key) {
            return { ...prev, [section]: { by: key, dir: 'asc' } };
        } else if (prev[section].dir === 'asc') {
            return { ...prev, [section]: { by: key, dir: 'desc' } };
        } else if (prev[section].dir === 'desc') {
            return { ...prev, [section]: { by: key, dir: 'original' } };
        } else {
            return { ...prev, [section]: { by: key, dir: 'asc' } };
        }
        });
    };

    return (
    <>
        {/* Main Content */}
        <Stack gap="xs" className={styles.mainContent}>
            {/* Owner Documents Section */}
            <SectionHeader
                title="Owner Documents"
                completed={sectionStatus(displayOwnerDocs).completed}
                total={sectionStatus(displayOwnerDocs).total}
                isOpen={opened.owner}
                onToggle={() => setOpened((o) => ({ ...o, owner: !o.owner }))}
                isComplete={sectionStatus(displayOwnerDocs).isComplete}
                icon={
                    <IconUser size={35} className={styles.iconBoxOwner}/>
                }
            />
            {opened.owner && (
                <Card withBorder p='xs' pb={0} ml='sm' className={styles.sectionCard}>
                <Collapse in={opened.owner} mt="sm">
                    <SortableTable
                    docs={displayOwnerDocs}
                    sortBy={sort.owner.by}
                    sortDir={sort.owner.dir}
                    onSort={(key) => handleSort('owner', key)}
                    uploadDocument={uploadDocument}
                    uploadedDocs={uploadedDocs}
                    setUploadedDocs={setUploadedDocs}
                    />
                </Collapse>
                </Card>
            )}
            <Divider my={opened.owner ? 24 : 8}/>

            {/* TODO: Guarantor Documents Section - Currently hidden as guarantor functionality is not configured in the backend
                When guarantor support is implemented in the backend, remove this conditional and uncomment the section below */}
            {false && (
                <>
                    {/* Guarantor Documents Section */}
                    <SectionHeader
                        title="Guarantor Documents"
                        completed={sectionStatus(displayGuarantorDocs).completed}
                        total={sectionStatus(displayGuarantorDocs).total}
                        isOpen={opened.guarantor}
                        onToggle={() => setOpened((o) => ({ ...o, guarantor: !o.guarantor }))}
                        isComplete={sectionStatus(displayGuarantorDocs).isComplete}
                        icon={
                            <IconShield size={35} className={styles.iconBoxGuarantor}/>
                        }
                    />
                    {opened.guarantor && (
                        <Card withBorder p='xs' pb={0} ml='sm' className={styles.sectionCard}>
                        <Collapse in={opened.guarantor} mt="sm">
                            <SortableTable
                            docs={displayGuarantorDocs}
                            sortBy={sort.guarantor.by}
                            sortDir={sort.guarantor.dir}
                            onSort={(key) => handleSort('guarantor', key)}
                            uploadDocument={uploadDocument}
                            uploadedDocs={uploadedDocs}
                            setUploadedDocs={setUploadedDocs}
                            />
                        </Collapse>
                        </Card>
                    )}
                    <Divider my={opened.guarantor ? 24 : 8} />
                </>
            )}

            {/* Business Documents Section */}
            <SectionHeader
                title="Business Documents"
                completed={sectionStatus(displayBusinessDocs).completed}
                total={sectionStatus(displayBusinessDocs).total}
                isOpen={opened.business}
                onToggle={() => setOpened((o) => ({ ...o, business: !o.business }))}
                isComplete={sectionStatus(displayBusinessDocs).isComplete}
                icon={
                    <IconBuilding size={35} className={styles.iconBoxBusiness} />
                }
            />
            {opened.business && (
                <Card withBorder p='xs' pb={0} ml='sm' className={styles.sectionCard}>
                <Collapse in={opened.business} mt="sm">
                    <SortableTable
                    docs={displayBusinessDocs}
                    sortBy={sort.business.by}
                    sortDir={sort.business.dir}
                    onSort={(key) => handleSort('business', key)}
                    uploadDocument={uploadDocument}
                    uploadedDocs={uploadedDocs}
                    setUploadedDocs={setUploadedDocs}
                    />
                </Collapse>
                </Card>
            )}
        </Stack>
    </>
  );
} 
