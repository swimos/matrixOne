package swim.matrixone;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.ValueLane;
import swim.recon.Recon;
import swim.structure.Record;
import swim.structure.Value;

/**
 * The Settings Agent handles the color state for the light
 * or other setting.
 */
public class SettingsAgent extends AbstractAgent {

  /**
   * Value lane to hold the current color object {r,g,b,w}
   */
  @SwimLane("rgbw")
  ValueLane<Value> color = this.<Value>valueLane();

  /**
   * Update Value lane with new color value
   */
  private void updateColor(String type, Double value) {
    color.set(color.get().updatedSlot(type, value));
  }

  /**
   * Command lane to receive data from ColorPicker.html
   * to update color red value
   */
  @SwimLane("addColorR")
  CommandLane<Double> addColorR = this.<Double>commandLane()
    .onCommand(v -> {
      updateColor("r", v);
    });

  /**
   * Command lane to receive data from ColorPicker.html
   * to update color green value
   */
  @SwimLane("addColorG")
  CommandLane<Double> addColorG = this.<Double>commandLane()
    .onCommand(v -> {
      updateColor("g", v);
    });

  /**
   * Command lane to receive data from ColorPicker.html
   * to update color blue value
   */
  @SwimLane("addColorB")
  CommandLane<Double> addColorB = this.<Double>commandLane()
    .onCommand(v -> {
      updateColor("b", v);
    });

  /**
   * Command lane to receive data from ColorPicker.html
   * to update color white value
   */
  @SwimLane("addColorW")
  CommandLane<Double> addColorW = this.<Double>commandLane()
    .onCommand(v -> {
      updateColor("w", v);
    });

  /**
   * Init one time when agent start
   */
  @Override
  public void didStart() {

      // set default record for color Value lane
      Record rec = Record.create(4).slot("r", 0).slot("g", 0).slot("b", 0).slot("w", 100);
      color.set(rec);
  }
}
