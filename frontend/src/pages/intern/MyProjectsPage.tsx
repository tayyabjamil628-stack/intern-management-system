import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Calendar,
  Clock,
  Building2,
  ArrowLeft,
  SearchX,
  Layers,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/data/SearchBar';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useProjects } from '../../context/ProjectsContext';
import { useInterns } from '../../context/InternsContext';
import { ProjectRecord } from '../../data/mockProjectsData';

export const MyProjectsPage: React.FC = () => {
  const { projects } = useProjects();
  const { interns } = useInterns();

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Identify the demo intern (INT-2026-001)
  const currentDemoIntern = useMemo(() => {
    return interns.find((i) => i.internId === 'INT-2026-001') || interns[0];
  }, [interns]);

  // Filter projects assigned to this demo intern
  const assignedProjects: ProjectRecord[] = useMemo(() => {
    return projects.filter(
      (p) =>
        p.assignedInternId === 'INT-2026-001' ||
        (currentDemoIntern && p.assignedInternId === currentDemoIntern.id) ||
        (currentDemoIntern && p.assignedInternId === currentDemoIntern.internId)
    );
  }, [projects, currentDemoIntern]);

  // Apply search query filter on project name and description
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return assignedProjects;
    }
    const query = searchQuery.toLowerCase().trim();
    return assignedProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.projectId.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query)
    );
  }, [assignedProjects, searchQuery]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Read-Only: No create/edit/delete actions) */}
      <PageHeader
        title="My Projects"
        description="View your assigned projects, deadlines, status, and progress."
        breadcrumbs={['Intern', 'My Projects']}
      />

      {/* 9. Quick Navigation & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Back to Dashboard Link */}
        <Link
          to="/intern"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors min-h-[44px] py-2 px-1 focus-visible:outline-2 focus-visible:outline-blue-600 rounded-md"
          aria-label="Back to Intern Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* 6. Search Bar (Only shown or enabled if there are assigned projects) */}
        {assignedProjects.length > 0 && (
          <div className="w-full sm:w-80">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by project name or description..."
              label="Search assigned projects"
              onClear={() => setSearchQuery('')}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {assignedProjects.length === 0 ? (
        /* 7. Empty State: Intern has no assigned projects */
        <EmptyState
          icon={<FolderKanban className="w-10 h-10 text-slate-400" />}
          title="No projects assigned"
          description="You currently have no projects assigned to you."
          action={
            <Link to="/intern">
              <Button
                variant="secondary"
                icon={<ArrowLeft className="w-4 h-4" />}
                className="min-h-[44px]"
              >
                Back to Dashboard
              </Button>
            </Link>
          }
        />
      ) : filteredProjects.length === 0 ? (
        /* 6. Search Empty State: No projects matched the query */
        <EmptyState
          icon={<SearchX className="w-10 h-10 text-slate-400" />}
          title="No projects found"
          description={`No assigned projects match your search "${searchQuery}".`}
          action={
            <Button
              variant="secondary"
              onClick={() => setSearchQuery('')}
              className="min-h-[44px]"
            >
              Clear Search
            </Button>
          }
        />
      ) : (
        /* 3, 4, 5, 8. Responsive Project Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="flex flex-col justify-between h-full border border-slate-200 hover:border-slate-300 transition-shadow duration-150"
              headerClassName="pb-3"
              bodyClassName="flex-1 flex flex-col justify-between pt-0"
            >
              {/* Card Header Content */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <span className="text-[11px] font-mono font-semibold text-slate-400 tracking-wider">
                    {project.projectId}
                  </span>
                  {/* 4. Status Badge */}
                  <Badge status={project.status} />
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-2">
                  {project.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {project.description}
                </p>
              </div>

              {/* Card Footer Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100 mt-auto">
                {/* 5. Progress Display (Read-Only) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Completion Progress
                    </span>
                    <span className="font-bold text-slate-900 text-xs">
                      {project.progress}%
                    </span>
                  </div>

                  <div
                    className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={project.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${project.name} progress: ${project.progress}%`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        project.progress === 100
                          ? 'bg-emerald-600'
                          : project.progress >= 50
                          ? 'bg-blue-600'
                          : project.progress > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key Meta Details (Start Date, Deadline, Department) */}
                <dl className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Start Date
                    </dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">
                      {formatDate(project.startDate)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Deadline
                    </dt>
                    <dd className="font-semibold text-slate-800 mt-0.5">
                      {formatDate(project.deadline)}
                    </dd>
                  </div>

                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      Department
                    </dt>
                    <dd className="font-semibold text-slate-800">
                      {project.department}
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
