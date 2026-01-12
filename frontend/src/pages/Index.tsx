import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GigCard from '@/components/gigs/GigCard';
import { categories } from '@/data/mockData';
import { gigApi, Gig } from '@/services/api';
import { ArrowRight, Briefcase, CheckCircle, Shield, Zap, Users, TrendingUp, Loader2 } from 'lucide-react';

const Index = () => {
  const [featuredGigs, setFeaturedGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        const data = await gigApi.getGigs();
        // Get latest 3 open gigs
        const openGigs = data.filter(g => g.status === 'open').slice(0, 3);
        setFeaturedGigs(openGigs);
      } catch (error) {
        console.error('Failed to fetch gigs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const stats = [
    { label: 'Active Freelancers', value: '10K+', icon: Users },
    { label: 'Projects Completed', value: '50K+', icon: CheckCircle },
    { label: 'Total Earnings', value: '$25M+', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Fast Matching',
      description: 'Get matched with the right freelancers within minutes, not days.',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Your payments are protected with our escrow system until work is approved.',
    },
    {
      icon: CheckCircle,
      title: 'Quality Guaranteed',
      description: 'Vetted freelancers with proven track records and verified skills.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1)_0%,transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-slide-up text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find Perfect Talent for
              <span className="text-gradient"> Every Project</span>
            </h1>
            <p className="animate-slide-up mt-6 text-lg text-muted-foreground sm:text-xl" style={{ animationDelay: '0.1s' }}>
              Connect with skilled freelancers, post gigs, and get work done. 
              GigFlow makes hiring and working simple, secure, and seamless.
            </p>
            <div className="animate-slide-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ animationDelay: '0.2s' }}>
              <Link to="/gigs">
                <Button size="xl" variant="gradient" className="gap-2">
                  Browse Gigs
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/post-gig">
                <Button size="xl" variant="outline" className="gap-2">
                  <Briefcase className="h-5 w-5" />
                  Post a Gig
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-slide-up mt-16 grid gap-6 sm:grid-cols-3" style={{ animationDelay: '0.3s' }}>
            {stats.map((stat, index) => (
              <Card key={stat.label} className="border-0 bg-card/60 backdrop-blur shadow-card">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Browse by Category</h2>
            <p className="mt-2 text-muted-foreground">Find the perfect gig in your area of expertise</p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link key={category} to={`/gigs?category=${encodeURIComponent(category)}`}>
                <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-all">
                  {category}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Latest Open Gigs</h2>
              <p className="mt-2 text-muted-foreground">Fresh opportunities waiting for you</p>
            </div>
            <Link to="/gigs">
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : featuredGigs.length > 0 ? (
              featuredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No open gigs available at the moment.</p>
                <Link to="/post-gig">
                  <Button className="mt-4">Post the First Gig</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Why Choose GigFlow?</h2>
            <p className="mt-2 text-muted-foreground">Built for freelancers and clients who value quality</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join thousands of freelancers and clients already using GigFlow
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" variant="accent" className="gap-2">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/gigs">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Explore Gigs
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
