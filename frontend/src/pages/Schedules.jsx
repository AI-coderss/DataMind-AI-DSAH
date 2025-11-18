
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  Play,
  Pause,
  Mail,
  FileDown,
  Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Schedules() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    frequency: "daily",
    time: "09:00",
    data_source_id: "",
    report_id: "", // Added report_id
    actions: []
  });

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => base44.entities.Schedule.list('-created_date'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: dataSources = [] } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list('-created_date'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports'],
    queryFn: () => base44.entities.Report.list('-created_date'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const createMutation = useMutation({
    mutationFn: (scheduleData) => base44.entities.Schedule.create(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setCreateDialogOpen(false);
      setNewSchedule({
        name: "",
        frequency: "daily",
        time: "09:00",
        data_source_id: "",
        report_id: "", // Reset report_id
        actions: []
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Schedule.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Schedule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const handleCreate = () => {
    if (!newSchedule.name || !newSchedule.data_source_id) return;
    
    createMutation.mutate({
      ...newSchedule,
      is_active: true,
      next_run: calculateNextRun(newSchedule.frequency, newSchedule.time),
      report_id: newSchedule.report_id === "none" ? null : newSchedule.report_id // Ensure null if "none" selected
    });
  };

  const calculateNextRun = (frequency, time) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
      if (frequency === 'daily') {
        next.setDate(next.getDate() + 1);
      } else if (frequency === 'weekly') {
        next.setDate(next.getDate() + 7);
      } else if (frequency === 'monthly') {
        next.setMonth(next.getMonth() + 1);
      }
    }

    return next.toISOString();
  };

  const actionIcons = {
    email: Mail,
    export: FileDown,
    alert: Bell
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">Schedules</h1>
            <p className="text-muted-foreground mt-1">Automate your analytics workflows</p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Schedule</DialogTitle>
                <DialogDescription>
                  Set up automated analytics and reporting
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Schedule Name</Label>
                  <Input
                    placeholder="Daily Sales Analysis"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frequency</Label>
                    <Select
                      value={newSchedule.frequency}
                      onValueChange={(value) => setNewSchedule({...newSchedule, frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Data Source</Label>
                  <Select
                    value={newSchedule.data_source_id}
                    onValueChange={(value) => setNewSchedule({...newSchedule, data_source_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Report Template (Optional)</Label>
                  <Select
                    value={newSchedule.report_id}
                    onValueChange={(value) => setNewSchedule({...newSchedule, report_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {reports.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={!newSchedule.name || !newSchedule.data_source_id}
                  className="w-full"
                >
                  Create Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Schedules List */}
        {schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule, index) => {
              const dataSource = dataSources.find(ds => ds.id === schedule.data_source_id);
              
              return (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-border/50 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold truncate">{schedule.name}</h3>
                              <Badge variant={schedule.is_active ? "default" : "secondary"}>
                                {schedule.is_active ? "Active" : "Paused"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Frequency</p>
                                <p className="font-medium capitalize">{schedule.frequency}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Time</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {schedule.time}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Data Source</p>
                                <p className="font-medium truncate">{dataSource?.name || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Next Run</p>
                                <p className="font-medium">
                                  {schedule.next_run
                                    ? new Date(schedule.next_run).toLocaleDateString()
                                    : "Not scheduled"}
                                </p>
                              </div>
                            </div>

                            {schedule.last_run && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Last run: {new Date(schedule.last_run).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={schedule.is_active}
                            onCheckedChange={(checked) =>
                              toggleMutation.mutate({ id: schedule.id, is_active: checked })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(schedule.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="glass-effect border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No schedules yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Automate your analytics with scheduled workflows
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
