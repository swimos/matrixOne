package swim.matrixone;

import swim.api.SwimRoute;
import swim.api.agent.AgentRoute;
import swim.api.plane.AbstractPlane;
import swim.client.ClientRuntime;
import swim.fabric.Fabric;
import swim.kernel.Kernel;
import swim.server.ServerLoader;
import swim.structure.Value;
import swim.uri.Uri;

/**
  The MatrixOnePlane is the top level of the app.
  This Swim Plane defines the routes to each WebAgent
 */
public class MatrixOnePlane extends AbstractPlane {

  /**
   * The Sensor WebAgent handles the current state for
   * one or more sensors. This includes both current value
   * and  historic values
   */
  @SwimRoute("/sensor/:id")
  AgentRoute<SensorAgent> sensorAgent;

  /**
   * The Settings Agent handles the color state for the light
   * or other setting.
   */
  @SwimRoute("/settings/:id")
  AgentRoute<SettingsAgent> SettingsAgent;

  public static void main(String[] args) throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServer();  // define our swim server kernel
    final Fabric fabric = (Fabric) kernel.getSpace("matrixone"); // define our data fabric

    //start the app
    kernel.start();
    System.out.println("Running Matrix One plane...");
    kernel.run();

    // TODO: look to see if client is needed here
    final ClientRuntime client = new ClientRuntime();
    client.start();

  }
}
