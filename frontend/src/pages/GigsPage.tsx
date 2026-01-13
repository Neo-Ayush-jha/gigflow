import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import GigCard from '@/components/gigs/GigCard';
import { categories } from '@/data/mockData';
import { gigApi, Gig } from '@/services/api';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import socketService from '@/services/socket';

const GigsPage = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('open');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch gigs from API
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        const data = await gigApi.getGigs();
        setGigs(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch gigs',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [toast]);

  // Socket.IO real-time updates
  useEffect(() => {
    // Connect socket
    socketService.connect();

    // Listen for new gigs
    const handleNewGig = (data: { gig: Gig }) => {
      setGigs((prevGigs) => [data.gig, ...prevGigs]);
      toast({
        title: 'New Gig Posted!',
        description: data.gig.title,
      });
    };

    // Listen for bid updates to update bidsCount
    const handleNewBid = (data: { gigId: string }) => {
      setGigs((prevGigs) =>
        prevGigs.map((gig) =>
          gig._id === data.gigId
            ? { ...gig, bidsCount: gig.bidsCount + 1 }
            : gig
        )
      );
    };

    socketService.on('gig-created', handleNewGig);
    socketService.on('bid-created', handleNewBid);

    // Cleanup
    return () => {
      socketService.off('gig-created', handleNewGig);
      socketService.off('bid-created', handleNewBid);
    };
  }, [toast]);

  const filteredGigs = useMemo(() => {
    let filtered = [...gigs];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(gig => gig.status === statusFilter);
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(gig => gig.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        gig =>
          gig.title.toLowerCase().includes(query) ||
          gig.description.toLowerCase().includes(query) ||
          gig.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'budget-high':
        filtered.sort((a, b) => b.budget.max - a.budget.max);
        break;
      case 'budget-low':
        filtered.sort((a, b) => a.budget.min - b.budget.min);
        break;
    }

    return filtered;
  }, [gigs, searchQuery, selectedCategory, sortBy, statusFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('newest');
    setStatusFilter('open');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || sortBy !== 'newest' || statusFilter !== 'open';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Browse Gigs</h1>
          <p className="mt-2 text-muted-foreground">
            Find the perfect opportunity from {gigs.length} available gigs
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 rounded-xl bg-card p-4 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search gigs, skills, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="budget-high">Budget: High to Low</SelectItem>
                <SelectItem value="budget-low">Budget: Low to High</SelectItem>
                <SelectItem value="bids">Most Bids</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''}
        </div>

        {filteredGigs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No gigs found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GigsPage;
