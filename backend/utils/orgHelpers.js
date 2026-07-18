const Employee = require('../models/Employee');

/**
 * Walks UP the reporting chain starting from `proposedManagerId` and checks
 * whether `employeeId` appears anywhere in it. If it does, assigning
 * `proposedManagerId` as the manager of `employeeId` would create a cycle
 * (e.g. A -> B -> C -> A).
 */
const wouldCreateCycle = async (employeeId, proposedManagerId) => {
  if (!proposedManagerId) return false;
  if (proposedManagerId.toString() === employeeId.toString()) return true;

  let currentId = proposedManagerId.toString();
  const visited = new Set();

  while (currentId) {
    if (currentId === employeeId.toString()) return true;
    if (visited.has(currentId)) break; // already-corrupt data, avoid infinite loop
    visited.add(currentId);

    const current = await Employee.findById(currentId).select('reportingManager').lean();
    if (!current || !current.reportingManager) break;
    currentId = current.reportingManager.toString();
  }

  return false;
};

/**
 * Turns a flat list of employees into a nested tree keyed by reportingManager.
 * Employees with no manager (or a manager not present in the list) become
 * roots.
 */
const buildTree = (employees) => {
  const byId = new Map();
  employees.forEach((emp) => {
    byId.set(emp._id.toString(), { ...emp, directReports: [] });
  });

  const roots = [];
  byId.forEach((emp) => {
    const managerId = emp.reportingManager ? emp.reportingManager.toString() : null;
    if (managerId && byId.has(managerId)) {
      byId.get(managerId).directReports.push(emp);
    } else {
      roots.push(emp);
    }
  });

  return roots;
};

module.exports = { wouldCreateCycle, buildTree };
