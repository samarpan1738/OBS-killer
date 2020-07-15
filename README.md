## Learnings

1) Every electron app has 1 main process and multiple render processes.
2) InterProcess Communication(IPC) -> Render process can access stuff on main process using "remote" module.
3) Electron is all about glueing together the APIs. **:)**