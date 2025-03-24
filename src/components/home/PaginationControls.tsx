
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationEllipsis 
} from '../ui/pagination'

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  setPage: (page: number) => void
}

const PaginationControls = ({ currentPage, totalPages, setPage }: PaginationControlsProps) => {
  // Generate pagination items
  const generatePaginationItems = () => {
    // Create UI logic for the pagination items
    const pages = []
    
    // Handle first page
    pages.push(
      <PaginationItem key="first">
        <PaginationLink 
          isActive={currentPage === 1}
          onClick={() => setPage(1)}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    )
    
    // Handle ellipsis and pages in between
    if (currentPage > 3) {
      pages.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Current page neighborhood
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i <= 1 || i >= totalPages) continue // Skip first and last pages (handled separately)
      
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={currentPage === i}
            onClick={() => setPage(i)}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    // Another ellipsis if needed
    if (currentPage < totalPages - 2) {
      pages.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      )
    }
    
    // Last page (if more than one page)
    if (totalPages > 1) {
      pages.push(
        <PaginationItem key="last">
          <PaginationLink 
            isActive={currentPage === totalPages}
            onClick={() => setPage(totalPages)}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(Math.max(currentPage - 1, 1))}
              className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
            />
          </PaginationItem>
          
          {generatePaginationItems()}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
              className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default PaginationControls
